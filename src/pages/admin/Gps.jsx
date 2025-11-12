import React, { useState, useEffect, useRef } from "react";
import {
  getAllGps,
  addGps,
  updateGps,
  activateGps,
  deleteGps,
} from "../../services/gpsService";

export default function GpsManagement() {
  const [gpsList, setGpsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGps, setEditingGps] = useState(null);
  const [formData, setFormData] = useState({
    latitude: "21.0285",
    longitude: "105.8542",
  });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadGpsList();
  }, []);

  useEffect(() => {
    if (showModal) {
      loadGoogleMapsAPI()
        .then(() => initializeMap())
        .catch((err) => console.error("Map initialization error:", err));
    }
  }, [showModal, formData]);

  /** ✅ Load Google Maps API with proper wait for importLibrary */
  const loadGoogleMapsAPI = async () => {
    if (window.google?.maps?.importLibrary) return;

    return new Promise((resolve, reject) => {
      const existing = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );

      if (existing) {
        // Wait for importLibrary to be available
        const checkImportLibrary = setInterval(() => {
          if (window.google?.maps?.importLibrary) {
            clearInterval(checkImportLibrary);
            resolve();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkImportLibrary);
          if (!window.google?.maps?.importLibrary) {
            reject(new Error("importLibrary not available"));
          }
        }, 5000);
        return;
      }

      const script = document.createElement("script");
      // TODO: Replace with your own Google Maps API key
      const API_KEY = "AIzaSyBxoYilx1SVAovHvjI5QRoRifr958b4ur8"; // <-- Replace this
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        // Wait for importLibrary to be available after script loads
        const checkImportLibrary = setInterval(() => {
          if (window.google?.maps?.importLibrary) {
            clearInterval(checkImportLibrary);
            resolve();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkImportLibrary);
          if (!window.google?.maps?.importLibrary) {
            reject(new Error("importLibrary not available after load"));
          }
        }, 5000);
      };

      script.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(script);
    });
  };

  /** ✅ Initialize Google Map */
  const initializeMap = async () => {
    if (!mapRef.current || !window.google?.maps?.importLibrary) return;

    try {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      const { Map } = await window.google.maps.importLibrary("maps");
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary(
        "marker"
      );
      const { Autocomplete } = await window.google.maps.importLibrary("places");

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter({ lat, lng });
        if (markerRef.current) {
          markerRef.current.position = { lat, lng };
        }
        return;
      }

      mapInstanceRef.current = new Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        mapId: "gps-management-map",
      });

      markerRef.current = new AdvancedMarkerElement({
        position: { lat, lng },
        map: mapInstanceRef.current,
        gmpDraggable: true,
      });

      markerRef.current.addListener("dragend", (event) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        updateCoordinates(newLat, newLng);
      });

      mapInstanceRef.current.addListener("click", (event) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        markerRef.current.position = { lat: newLat, lng: newLng };
        updateCoordinates(newLat, newLng);
      });

      // Initialize Autocomplete
      if (searchInputRef.current && !autocompleteRef.current) {
        autocompleteRef.current = new Autocomplete(searchInputRef.current, {
          fields: ["geometry", "name", "formatted_address"],
        });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (place.geometry && place.geometry.location) {
            const newLat = place.geometry.location.lat();
            const newLng = place.geometry.location.lng();

            mapInstanceRef.current.setCenter({ lat: newLat, lng: newLng });
            mapInstanceRef.current.setZoom(17);
            markerRef.current.position = { lat: newLat, lng: newLng };
            updateCoordinates(newLat, newLng);
            setSearchQuery(place.formatted_address || place.name || "");
          }
        });
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  const updateCoordinates = (lat, lng) => {
    setFormData({
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });
  };

  const loadGpsList = async () => {
    try {
      setLoading(true);
      const data = await getAllGps();
      setGpsList(data || []);
    } catch (error) {
      console.error("❌ loadGpsList Error:", error);
      alert("Không thể tải danh sách GPS: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingGps) {
        await updateGps({
          gpsId: editingGps.gpsId,
          newGps: `${formData.latitude},${formData.longitude}`,
        });
        alert("✅ Cập nhật GPS thành công!");
      } else {
        await addGps({
          gps: `${formData.latitude},${formData.longitude}`,
        });
        alert("✅ Thêm GPS thành công!");
      }
      closeModal();
      await loadGpsList();
    } catch (error) {
      console.error("❌ handleSubmit Error:", error);
      alert("❌ Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (gpsId) => {
    try {
      setLoading(true);
      await activateGps(gpsId);
      alert("🚀 Đã kích hoạt GPS!");
      await loadGpsList();
    } catch (error) {
      alert("❌ Lỗi khi kích hoạt: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gpsId) => {
    if (!window.confirm("Bạn có chắc muốn xóa GPS này?")) return;
    try {
      setLoading(true);
      await deleteGps(gpsId);
      alert("🗑️ Đã xóa GPS!");
      await loadGpsList();
    } catch (error) {
      alert("❌ Lỗi khi xóa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (gps = null) => {
    if (gps) {
      const [lat, lng] = gps.gps.split(",");
      setEditingGps(gps);
      setFormData({ latitude: lat, longitude: lng });
    } else {
      setEditingGps(null);
      setFormData({ latitude: "21.0285", longitude: "105.8542" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGps(null);
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
            Quản lý GPS
          </h1>
          <button
            onClick={() => openModal()}
            style={{
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            + Thêm GPS
          </button>
        </div>

        {loading && !showModal ? (
          <p style={{ textAlign: "center" }}>Đang tải...</p>
        ) : gpsList.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "40px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <p>Chưa có GPS nào. Nhấn "Thêm GPS" để bắt đầu.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {gpsList.map((gps) => (
              <div
                key={gps.gpsId}
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h3 style={{ marginBottom: "8px" }}>GPS #{gps.gpsId}</h3>
                <p style={{ fontSize: "14px", color: "#666" }}>📍 {gps.gps}</p>
                <p
                  style={{
                    fontSize: "12px",
                    color: gps.active ? "#22c55e" : "#999",
                    marginTop: "4px",
                  }}
                >
                  {gps.active ? "● Đang hoạt động" : "○ Chưa kích hoạt"}
                </p>
                <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleActivate(gps.gpsId)}
                    disabled={gps.active}
                    style={{
                      flex: 1,
                      backgroundColor: gps.active ? "#ccc" : "#22c55e",
                      color: "white",
                      border: "none",
                      padding: "8px",
                      borderRadius: "4px",
                      cursor: gps.active ? "not-allowed" : "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Kích hoạt
                  </button>
                  <button
                    onClick={() => openModal(gps)}
                    style={{
                      flex: 1,
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      padding: "8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(gps.gpsId)}
                    style={{
                      flex: 1,
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                width: "90%",
                maxWidth: "800px",
                maxHeight: "90vh",
                overflow: "auto",
              }}
            >
              <h2 style={{ marginBottom: "16px", fontSize: "20px" }}>
                {editingGps ? "Chỉnh sửa GPS" : "Thêm GPS mới"}
              </h2>

              {/* Search Box */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  🔍 Tìm kiếm địa điểm
                </label>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Nhập tên địa điểm hoặc địa chỉ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 250px", minWidth: "250px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Vĩ độ (Latitude)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "12px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Kinh độ (Longitude)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                <div
                  ref={mapRef}
                  style={{
                    flex: "1 1 400px",
                    height: "400px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f5f5f5",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                  gap: "10px",
                }}
              >
                <button
                  onClick={closeModal}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    backgroundColor: "white",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading
                    ? "Đang xử lý..."
                    : editingGps
                    ? "Cập nhật"
                    : "Thêm mới"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
