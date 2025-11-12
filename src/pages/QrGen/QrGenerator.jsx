import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { generateQrCode } from "../../services/attendanceService";

export default function QrGenerator() {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateQrCode("MY_CODE_123");
      setQrData(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        disabled={loading}
      >
        {loading ? "Đang tạo..." : "Tạo mã QR"}
      </button>

      {qrData && (
        <div className="p-4 border rounded shadow">
          <QRCodeCanvas value={qrData} size={200} />
          <p className="mt-2 text-sm text-gray-600 break-all">{qrData}</p>
        </div>
      )}
    </div>
  );
}
