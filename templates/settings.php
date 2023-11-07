<div class="wrap vercel-dashboard">   
  <h1>Vercel Plugin Settings</h1>
  <br/>
  <form method="post" action="options.php">
    <?php settings_fields( 'vercel_options_group' ); ?>
    <?php do_settings_sections( 'vercel_options_group' ); ?>

    <div class="setting-input">
      <label for="vercel_secret_token">Secret Token</label>
      <input type="text" id="vercel_secret_token" name="vercel_secret_token" value="<?php echo get_option('vercel_secret_token'); ?>" />
    </div>
    <div class="setting-input">
      <label for="vercel_site_domain">Site Domain</label>
      <input type="text" id="vercel_site_domain" name="vercel_site_domain" value="<?php echo (get_option('vercel_site_domain') == '' ? get_option(['home']) : get_option('vercel_site_domain')); ?>" />
    </div>
    <div class="setting-input">
      <label for="vercel_post_types">Post Types</label>
      <div>
        <?php $values = get_option( 'vercel_post_types' ); ?>
        <?php
          $post_types = get_post_types( array( 'public' => true ), 'objects' );
          $post_types = array_filter( $post_types, function( $post_type ) {
          return ! in_array( $post_type->name, array( 'attachment', 'wp_block' ) );
          });
          foreach ( $post_types as $post_type ) {
            echo "<input type=\"checkbox\" id=\"$post_type->name\" name=\"vercel_post_types[]\" value=\"$post_type->name\" " . checked( in_array( $post_type->name, $values ), true, false ) . "/>";
            echo '<label for="' . $post_type->name . '">' . $post_type->name . '</label><br/>';
          }
        ?>
      </div>
      </div>
    </div>
    <?php  submit_button(); ?>
  </form>
</div>