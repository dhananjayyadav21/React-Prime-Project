import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import axios from "axios";

// Define the shape of our data
interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ArtworksTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  const [targetCount, setTargetCount] = useState(0);

  const overlayRef = useRef<OverlayPanel>(null);

  // Fetch data from API ------------------------------
  const fetchArtworks = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rows}`
      );

      setArtworks(response.data.data);
      setTotalRecords(response.data.pagination.total);
    } catch (error) {
      console.error("Failed to load artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when pagination changes ------------------------------
  useEffect(() => {
    const currentPage = first / rows + 1;
    fetchArtworks(currentPage);
  }, [first, rows]);

  const handlePageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  // Handle user selecting rows manually ------------------------------
  const handleSelectionChange = (e: { value: Artwork[] }) => {
    setSelectedRows(e.value);
  };

  // Auto-select rows after user enters a target count ------------------------------
  const handleAutoSelect = () => {
    if (targetCount > 0) {
      let updatedSelection = [...selectedRows];
      for (const artwork of artworks) {
        if (updatedSelection.length >= targetCount) break;
        if (!updatedSelection.find((row) => row.id === artwork.id)) {
          updatedSelection.push(artwork);
        }
      }
      setSelectedRows(updatedSelection);
    }
    overlayRef.current?.hide();
  };

  // Continue auto-select when user navigates pages ------------------------------
  useEffect(() => {
    if (targetCount > 0 && selectedRows.length < targetCount) {
      let updatedSelection = [...selectedRows];
      for (const artwork of artworks) {
        if (updatedSelection.length >= targetCount) break;
        if (!updatedSelection.find((row) => row.id === artwork.id)) {
          updatedSelection.push(artwork);
        }
      }
      setSelectedRows(updatedSelection);
    }
  }, [artworks]);

  // Custom column header for dropdown input ------------------------------
  const dropdownHeader = (
    <>
      <Button
        icon="pi pi-chevron-down"
        className="p-button-text p-button-sm"
        onClick={(e) => overlayRef.current?.toggle(e)}
      />
      <OverlayPanel ref={overlayRef}>
        <div className="p-fluid" style={{ width: "200px" }}>
          <InputText
            value={targetCount ? targetCount.toString() : ""}
            onChange={(e) => setTargetCount(Number(e.target.value))}
            placeholder="Enter rows..."
          />
          <Button
            label="Submit"
            className="p-mt-2"
            style={{ marginTop: "8px", width: "100%" }}
            onClick={handleAutoSelect}
          />
        </div>
      </OverlayPanel>
    </>
  );

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <h2>Artworks Table</h2>

      <DataTable
        value={artworks}
        loading={loading}
        selection={selectedRows}
        onSelectionChange={handleSelectionChange}
        dataKey="id"
        paginator={false}
        selectionMode={"multiple"}
        responsiveLayout="scroll"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />

        <Column
          header={dropdownHeader}
          style={{ width: "4rem", textAlign: "center" }}
        />

        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      <Paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
      />

      {/*--- Selected Rows Panel ------------------------------*/}
      <div
        style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}
      >
        <h3>
          Selected Rows: {selectedRows.length} / Target: {targetCount}
        </h3>
        {selectedRows.length > 0 ? (
          selectedRows.map((item) => (
            <div style={{ padding: "10px 0" }} key={item.id}>
              {item.title} - ({item.place_of_origin})
            </div>
          ))
        ) : (
          <p>No rows selected.</p>
        )}
      </div>
    </div>
  );
};

export default ArtworksTable;
