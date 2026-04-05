import React from "react";

const PaymentsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>
      <p>
        This is a dummy payments system page. Payment functionality will be
        implemented here.
      </p>
    </div>
  );
};

const PriceList = () => {
  const prices = [
    { name: "General Checkup", price: "$50" },
    { name: "Blood Test", price: "$30" },
    { name: "X-Ray", price: "$100" },
    { name: "MRI Scan", price: "$500" },
    { name: "Specialist Consultation", price: "$150" },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Price List</h1>
      <ul className="list-disc pl-5">
        {prices.map((item, index) => (
          <li key={index} className="mb-2">
            {item.name}: <span className="font-semibold">{item.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentsPage;
