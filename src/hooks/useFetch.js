import { useEffect, useState } from "react";
import apiFetch from "@wordpress/api-fetch";

export default function useFetch(url) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const response = await apiFetch({ path: url });

      setData(response);
    }

    loadData();
  }, [url]);

  return data;
}
