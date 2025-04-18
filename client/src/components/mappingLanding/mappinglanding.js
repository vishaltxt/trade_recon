import React from "react";

const Mappinglanding = ({onAddNew}) => {

  const data = [
    {
      master_id: "111",
      minion_id: "544",
      percentage_replication: "100%",
      replication: "Yes",
      created_at: "12-01-20250",
    },
    {
      master_id: "222",
      minion_id: "223",
      percentage_replication: "100%",
      replication: "Yes",
      created_at: "01-01-2025",
    },
    {
      master_id: "333",
      minion_id: "123",
      percentage_replication: "100%",
      replication: "Yes",
      created_at: "10-04-2025",
    },
    {
      master_id: "333",
      minion_id: "123",
      percentage_replication: "100%",
      replication: "Yes",
      created_at: "10-04-2025",
    },
    {
      master_id: "333",
      minion_id: "123",
      percentage_replication: "100%",
      replication: "Yes",
      created_at: "10-04-2025",
    },
  ];

  return (
    <div>
      {/* <h2 className="text-lg m-3 font-bold">Mapping</h2>
      <hr /> */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl  font-bold m-4">All Mappings <span className="text-sm">10 items</span></h1>
        </div>
        <div>
          <button className="text-white bg-[#586f80] p-1 w-32 rounded-md mr-5" onClick={onAddNew}>
            +Add Mappings
          </button>
        </div>
      </div>
      <div>
        <div className="flex w-[98%] m-auto bg-gray-100 font-bold text-[#637f92]">
          <div className="border p-3 w-full md:w-1/3 ">Master ID</div>
          <div className="border p-3 w-full md:w-1/3 ">Minion Id</div>
          <div className="border p-3 w-full md:w-1/3">Percentage for Replication</div>
          <div className="border p-3 w-full md:w-1/3">Replication</div>
          <div className="border p-3 w-full md:w-1/3">Created At</div>
        </div>
      </div>
      {data.map((items, index) => (
        <div key={index} className="flex w-[98%] m-auto">
          <div className="border p-3 w-full md:w-1/3 ">{items.master_id}</div>
          <div className="border p-3 w-full md:w-1/3 ">{items.minion_id}</div>
          <div className="border p-3 w-full md:w-1/3">{items.percentage_replication}</div>
          <div className="border p-3 w-full md:w-1/3">{items.replication}</div>
          <div className="border p-3 w-full md:w-1/3">{items.created_at}</div>
        </div>
      ))}
    </div>
  );
};

export default Mappinglanding;
