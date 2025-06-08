import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

// Worker real desde la misma versión
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

function PDFViewer() {
  const canvasRef = useRef();
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const file = params.get("file");
    if (file) {
      const cleaned = decodeURIComponent(file).replace(/\\/g, "/");
      setFileUrl(cleaned);
    }
  }, []);

  useEffect(() => {
    const renderPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        setLoading(false);
      } catch (err) {
        console.error("❌ Error al renderizar PDF:", err);
        setError("No se pudo cargar el PDF. Asegúrate que el archivo existe y es accesible.");
        setLoading(false);
      }
    };

    if (fileUrl) renderPDF();
  }, [fileUrl]);

  return (
    <div className="flex flex-col items-center p-6">
      <p className="text-sm text-gray-700 mb-4 break-all">Archivo: {fileUrl}</p>

      {loading && <p className="text-blue-600">Cargando PDF...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}
      {!loading && !error && (
        <canvas ref={canvasRef} className="rounded shadow bg-white" />
      )}
    </div>
  );
}

export default PDFViewer;