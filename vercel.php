<?php
/**
 * Plugin Name:       Vercel Redeploy/Revalidate
 * Description:       Redeploy/Revalidate Vercel sites
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.7.0
 * Author:            Overlap Interactive
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       vercel
 */

include plugin_dir_path( __FILE__ ) . '/restful_endpoints.php';

add_action( 'admin_menu', 'vercel_init_menu' );
function vercel_register_settings() {
    add_option( 'vercel_secret_token', '');
    add_option( 'vercel_site_domain', '');
    add_option( 'vercel_post_types', '');

    register_setting( 'vercel_options_group', 'vercel_secret_token');
    register_setting( 'vercel_options_group', 'vercel_site_domain');
    register_setting( 'vercel_options_group', 'vercel_post_types');
 }
add_action( 'admin_init', 'vercel_register_settings' );

/**
 * Init Admin Menu.
 *
 * @return void
 */
function vercel_init_menu() {
    add_menu_page( 'Vercel', "Vercel", 'manage_options', 'vercel', 'vercel_admin_page');
    add_submenu_page('vercel', 'Settings', 'Settings', 'manage_options', 'settings', 'vercel_option_page');
}

function vercel_option_page()
{
    require_once plugin_dir_path( __FILE__ ) . 'templates/settings.php';
}

/**
 * Init Admin Page.
 *
 * @return void
 */
function vercel_admin_page() {
    require_once plugin_dir_path( __FILE__ ) . 'templates/app.php';
}

add_action( 'admin_enqueue_scripts', 'vercel_admin_enqueue_scripts' );

/**
 * Enqueue scripts and styles.
 *
 * @return void
 */
function vercel_admin_enqueue_scripts() {
    wp_enqueue_style( 'vercel-style', plugin_dir_url( __FILE__ ) . 'build/index.css' );
    wp_enqueue_script(
        'vercel-script',
        plugin_dir_url( __FILE__ ) . 'build/index.js',
        array( 'wp-element', 'wp-polyfill', 'wp-api-fetch' ), '1.0.1', true 
    );

    $scriptData = array(
        'secretToken' => get_option('vercel_secret_token'),
        'siteDomain' => get_option(['vercel_site_domain']),
        'siteUrl' => get_option(['home']),
        'postTypes' => maybe_unserialize(get_option(['vercel_post_types']))
    );

    wp_localize_script('vercel-script', 'vercel_options', $scriptData);
}

add_action( 'rest_api_init', function() {
    $controller = new VERCEL_CUSTOM_ROUTES;
    $controller->register_routes();
});

function create_the_vercel_table() {
    echo "trigger create";
    global $wpdb;
    global $charset_collate;
    $table_name = $wpdb->prefix . 'vercel_deploy';
     $sql = "CREATE TABLE IF NOT EXISTS $table_name (
      `id` bigint(20) NOT NULL AUTO_INCREMENT,
      `postId` varchar(255) NOT NULL,
      `deployed_time` datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
       PRIMARY KEY (`id`)
    )$charset_collate;";
     require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
     dbDelta( $sql );
}

function delete_the_vercel_table() {
    global $wpdb;
    $table_name = $wpdb -> prefix. 'vercel_deploy';
    $sql = "DROP TABLE IF EXISTS $table_name";
    $wpdb->query($sql);
}

register_activation_hook(__FILE__, 'create_the_vercel_table');
register_deactivation_hook( __FILE__, 'delete_the_vercel_table' );

