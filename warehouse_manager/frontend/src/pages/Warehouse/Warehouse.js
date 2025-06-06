import React, { useEffect, useState } from "react";

export default function Warehouse() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/components/")
      .then(res => res.json())
      .then(data => {
        setComponents(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-ocean-900">Magazyn – Komponenty</h1>
      {loading ? (
        <div>Ładowanie...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2">R</th>
                <th className="px-2 py-2">Nazwa cała</th>
                <th className="px-2 py-2">Stan</th>
                <th className="px-2 py-2">Ilość dostępna</th>
                <th className="px-2 py-2">j.m.</th>
                <th className="px-2 py-2">Cena zakupu netto</th>
                <th className="px-2 py-2">Cena sprzedaży netto</th>
                <th className="px-2 py-2">Kod kreskowy</th>
                <th className="px-2 py-2">Indeks katalogowy</th>
                <th className="px-2 py-2">Zarezerwowano</th>
                <th className="px-2 py-2">Nazwa krótka</th>
                <th className="px-2 py-2">Nazwa oryg.</th>
                <th className="px-2 py-2">Dostawcy dostarczą</th>
                <th className="px-2 py-2">Odbiorcy odbiorą</th>
                <th className="px-2 py-2">C. zakupu netto wal.</th>
                <th className="px-2 py-2">Vat sprz.</th>
                <th className="px-2 py-2">Marża [%]</th>
                <th className="px-2 py-2">F</th>
                <th className="px-2 py-2">Producent</th>
                <th className="px-2 py-2">Nr artykułu</th>
                <th className="px-2 py-2">S</th>
                <th className="px-2 py-2">Zał.</th>
                <th className="px-2 py-2">Wyróżnik</th>
                <th className="px-2 py-2">A</th>
                <th className="px-2 py-2">Indeks producenta</th>
                <th className="px-2 py-2">Kod CN</th>
                <th className="px-2 py-2">Kraj pochodzenia</th>
                <th className="px-2 py-2">JPK Klasyfikacja</th>
                <th className="px-2 py-2">Narzut [%]</th>
              </tr>
            </thead>
            <tbody>
              {components.map(comp => (
                <tr key={comp.id}>
                  <td className="px-2 py-2">{comp.r}</td>
                  <td className="px-2 py-2">{comp.full_name}</td>
                  <td className="px-2 py-2">{comp.stock}</td>
                  <td className="px-2 py-2">{comp.available_quantity}</td>
                  <td className="px-2 py-2">{comp.unit}</td>
                  <td className="px-2 py-2">{comp.purchase_price_net}</td>
                  <td className="px-2 py-2">{comp.sale_price_net}</td>
                  <td className="px-2 py-2">{comp.barcode}</td>
                  <td className="px-2 py-2">{comp.catalog_index}</td>
                  <td className="px-2 py-2">{comp.reserved}</td>
                  <td className="px-2 py-2">{comp.short_name}</td>
                  <td className="px-2 py-2">{comp.original_name}</td>
                  <td className="px-2 py-2">{comp.suppliers_will_deliver}</td>
                  <td className="px-2 py-2">{comp.recipients_will_receive}</td>
                  <td className="px-2 py-2">{comp.purchase_price_net_currency}</td>
                  <td className="px-2 py-2">{comp.vat_sale}</td>
                  <td className="px-2 py-2">{comp.margin_percent}</td>
                  <td className="px-2 py-2">{comp.f}</td>
                  <td className="px-2 py-2">{comp.producer}</td>
                  <td className="px-2 py-2">{comp.article_number}</td>
                  <td className="px-2 py-2">{comp.s}</td>
                  <td className="px-2 py-2">{comp.attachment}</td>
                  <td className="px-2 py-2">{comp.marker}</td>
                  <td className="px-2 py-2">{comp.a}</td>
                  <td className="px-2 py-2">{comp.producer_index}</td>
                  <td className="px-2 py-2">{comp.cn_code}</td>
                  <td className="px-2 py-2">{comp.country_of_origin}</td>
                  <td className="px-2 py-2">{comp.jpk_classification}</td>
                  <td className="px-2 py-2">{comp.markup_percent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}