import { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  FileSpreadsheet,
  Camera,
  Copy,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './App.css';

interface TableRow {
  id: number;
  name: string;
  email: string;
  role: string;
}

function App() {
  const [tableData, setTableData] = useState<TableRow[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer' },
  ]);

  const [images, setImages] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const addRow = () => {
    const newRow: TableRow = {
      id: tableData.length + 1,
      name: 'New User',
      email: 'new@example.com',
      role: 'Viewer'
    };
    setTableData([...tableData, newRow]);
  };

  const removeRow = (id: number) => {
    setTableData(tableData.filter(row => row.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const exportCSV = () => {
    const csv = Papa.unparse(tableData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'table_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const takeScreenshot = async (download = true) => {
    if (!contentRef.current) return;
    const canvas = await html2canvas(contentRef.current);
    if (download) {
      const link = document.createElement('a');
      link.download = 'screenshot.png';
      link.href = canvas.toDataURL();
      link.click();
    } else {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert('Screenshot copied to clipboard!');
          } catch (err) {
            console.error('Failed to copy: ', err);
          }
        }
      });
    }
  };

  const exportPDF = async () => {
    if (!contentRef.current) return;
    const canvas = await html2canvas(contentRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('page_capture.pdf');
  };

  return (
    <div className="container">
      <header>
        <h1>Panel de Control</h1>
        <div className="actions">
          <button onClick={exportCSV} title="Exportar CSV">
            <FileSpreadsheet size={20} /> Exportar CSV
          </button>
          <button onClick={() => takeScreenshot(true)} title="Descargar Captura">
            <Camera size={20} /> Captura
          </button>
          <button onClick={() => takeScreenshot(false)} title="Copiar al Portapapeles">
            <Copy size={20} /> Copiar
          </button>
          <button onClick={exportPDF} title="Exportar PDF">
            <FileText size={20} /> Exportar PDF
          </button>
        </div>
      </header>

      <main ref={contentRef} id="main-content">
        <section className="card">
          <div className="card-header">
            <h2>Datos de Usuario</h2>
            <button className="btn-add" onClick={addRow}>
              <Plus size={16} /> Añadir Fila
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.role}</td>
                  <td>
                    <button className="btn-delete" onClick={() => removeRow(row.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>Imágenes</h2>
          <div className="upload-zone">
            <label htmlFor="file-upload" className="custom-file-upload">
              <ImageIcon size={24} />
              <span>Haz clic para subir imágenes</span>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div className="image-grid">
            {images.map((src, index) => (
              <div key={index} className="image-item">
                <img src={src} alt={`Uploaded ${index}`} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
