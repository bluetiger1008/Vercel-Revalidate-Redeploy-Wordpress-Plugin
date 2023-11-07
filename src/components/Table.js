import { useState, useEffect, useMemo } from "react";
import {
  useTable,
  usePagination,
  useFilters,
  useGlobalFilter,
  useSortBy,
} from "react-table";
import { useQuery } from "react-query";
import apiFetch from "@wordpress/api-fetch";

import RevalidateBtn from "./RevalidateButton";

const Table = ({ tableData, settings }) => {
  const {
    isLoading,
    isError,
    data: deployments,
    error,
  } = useQuery("deployments", async () => {
    const response = await apiFetch({ path: "/overlap/vercel/deployments" });

    return response;
  });

  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState(tableData);
  const [pageType, setPageType] = useState("All");

  const pageTypes = useMemo(() => {
    let options = [];
    tableData.map((row) => {
      if (!options.includes(row.type)) {
        options = [...options, row.type];
      }
    });

    return options;
  }, [tableData]);

  const columns = React.useMemo(
    () => [
      {
        Header: "Page Title",
        accessor: "post_title", // accessor is the "key" in the data
        width: "auto",
      },
      {
        Header: "Post Type",
        accessor: "type",
        filter: "includes",
        width: 150,
      },
      {
        Header: "Clear Post Cache",
        Cell: ({ cell }) => {
          return <RevalidateBtn settings={settings} cell={cell} />;
        },
        width: 150,
      },
      {
        Header: "Open in New Tab",
        accessor: "link",
        Cell: ({ value }) => {
          return (
            <a href={value} target="_blank" className="vercel-open-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M18.2 17c0 .7-.6 1.2-1.2 1.2H7c-.7 0-1.2-.6-1.2-1.2V7c0-.7.6-1.2 1.2-1.2h3.2V4.2H7C5.5 4.2 4.2 5.5 4.2 7v10c0 1.5 1.2 2.8 2.8 2.8h10c1.5 0 2.8-1.2 2.8-2.8v-3.6h-1.5V17zM14.9 3v1.5h3.7l-6.4 6.4 1.1 1.1 6.4-6.4v3.7h1.5V3h-6.3z"></path>
              </svg>{" "}
            </a>
          );
        },
        width: 150,
      },
      {
        Header: "Deployed Date",
        Cell: ({ row }) => {
          const deployment = deployments?.find(
            (x) => x.postId === `${row.original.id}`
          );

          return <p>{deployment?.deployed_time}</p>;
        },
      },
    ],
    [deployments]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page
    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageIndex: 0 },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const onChangeSearch = (e) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    setFilteredData(
      tableData.filter((x) => {
        if (pageType !== "All") {
          return (
            x.post_title.toLowerCase().includes(searchValue.toLowerCase()) &&
            x.type === pageType
          );
        }

        return x.post_title.toLowerCase().includes(searchValue.toLowerCase());
      })
    );
  }, [searchValue, pageType]);

  const onChangePageType = (e) => {
    setPageType(e.target.value);
  };

  return (
    <>
      <div className="vercel-filters">
        <input
          type="search"
          placeholder={`Search ${tableData.length} records...`}
          value={searchValue}
          onChange={onChangeSearch}
        />

        <select value={pageType} onChange={onChangePageType}>
          <option value="All">All</option>
          {pageTypes.map((option, i) => (
            <option key={i} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <table {...getTableProps()} className="vercel-table">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps({
                    ...column.getSortByToggleProps(),
                    style: { width: column.width },
                  })}
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      <div className="pagination">
        <button
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
          className="button action"
        >
          {"<<"}
        </button>{" "}
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          className="button action"
        >
          {"<"}
        </button>{" "}
        <button
          onClick={() => nextPage()}
          disabled={!canNextPage}
          className="button action"
        >
          {">"}
        </button>{" "}
        <button
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
          className="button action"
        >
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default Table;
