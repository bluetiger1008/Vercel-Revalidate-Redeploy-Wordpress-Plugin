import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { Oval } from "react-loader-spinner";

import { AppContext } from "../App";
import apiFetch from "@wordpress/api-fetch";
import { QueryClient, useQueryClient } from "react-query";

const RevalidateBtn = ({ settings, cell }) => {
  const context = useContext(AppContext);
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const siteDomain =
    settings.siteDomain === "" ? settings.siteUrl : settings.siteDomain;
  const { validatedPaths, onUpdateValidatedPaths } = context;
  const row = cell.row.original;

  const onRevalidate = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${siteDomain}/api/revalidate?secret=${settings.secretToken}&slug=${row.relative_path}`
      );

      await apiFetch({
        path: "/overlap/vercel/deployments",
        method: "POST",
        data: {
          postId: row.id,
          deployed_time: new Date(),
        },
      });

      queryClient.invalidateQueries("deployments");

      if (res.status >= 400 && res.status < 600) {
        const parsedRes = await res.json();

        throw parsedRes.message;
      }

      toast.success("Revalidate is successed", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      onUpdateValidatedPaths(row.relative_path);
    } catch (err) {
      toast.error(err, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  return validatedPaths.includes(row.relative_path) ? (
    <div className="vercel-revalidated-status">
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </span>
    </div>
  ) : (
    <button
      className="button action btn-revalidate"
      onClick={() => onRevalidate()}
      disabled={
        settings.siteUrl === "" || settings.secretToken === "" || loading
      }
    >
      {loading ? (
        <Oval
          height={20}
          width={20}
          color="#4fa94d"
          wrapperStyle={{}}
          visible={true}
          ariaLabel="oval-loading"
          secondaryColor="#4fa94d"
          strokeWidth={6}
          strokeWidthSecondary={6}
          wrapperClass="vercel-loader"
        />
      ) : (
        "Clear Post Cache"
      )}
    </button>
  );
};

export default RevalidateBtn;
