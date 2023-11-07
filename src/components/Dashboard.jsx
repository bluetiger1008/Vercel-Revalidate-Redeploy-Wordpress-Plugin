import React, { useEffect, useContext, useState } from "react";
import { toast } from "react-toastify";
import { Oval } from "react-loader-spinner";

import useFetch from "../hooks/useFetch";
import Table from "./Table";
import { AppContext } from "../App";

const Dashboard = () => {
  const context = useContext(AppContext);
  const { settings } = context;
  const [loading, setLoading] = useState(false);

  const allPages =
    settings.postTypes === ""
      ? useFetch(`/overlap/all-pages`)
      : useFetch(`/overlap/all-pages?type=${settings.postTypes.join(",")}`);

  const siteDomain =
    settings.siteDomain === "" ? settings.siteUrl : settings.siteDomain;

  const onRedeploy = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${siteDomain}/api/redeploy`);

      if (res.status >= 400 && res.status < 600) {
        const parsedRes = await res.json();

        throw parsedRes.message;
      }

      toast.success(
        "Successfully cleared site cache. Please allow up to 2 minutes for changes to take effect.",
        {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    } catch (err) {
      console.log(err);
      toast.error("Redeploy failed. Site cache was not cleared.", {
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

  return (
    <div className="vercel-dashboard">
      <div className="vercel-heading">
        <button
          className="button action"
          onClick={onRedeploy}
          disabled={settings.deployUrl === ""}
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
            "Clear Site Cache"
          )}
        </button>
      </div>

      {allPages.length > 0 && (
        <Table tableData={[...allPages]} settings={settings} />
      )}
    </div>
  );
};

export default Dashboard;
