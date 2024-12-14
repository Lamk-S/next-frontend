'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getAmbientesReporte } from '@/app/api/reportesApi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReporteAmbientes = () => {
    const [ambientesPorEntidad, setAmbientesPorEntidad] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAmbientes = async () => {
            try {
                const data = await getAmbientesReporte();
    
                // Agrupar ambientes por entidad
                const agrupados = data.reduce((acc: Record<string, any[]>, ambiente: any) => {
                    const entidad = ambiente.escuela_nombre
                        ? `ESCUELA PROFESIONAL DE ${ambiente.escuela_nombre.toUpperCase()}`
                        : ambiente.departamento_nombre
                        ? `${ambiente.departamento_nombre.toUpperCase()}`
                        : 'SIN ESCUELA/DEPARTAMENTO';
    
                    // Asegurarse de que el campo tipo_ambiente esté presente
                    const ambienteNormalizado = {
                        ...ambiente,
                        tipo_ambiente: ambiente.tipo_ambiente__nombre, // Normalizamos el nombre del tipo de ambiente
                    };
    
                    if (!acc[entidad]) acc[entidad] = [];
                    acc[entidad].push(ambienteNormalizado);
                    return acc;
                }, {});
    
                setAmbientesPorEntidad(agrupados);
            } catch (error) {
                console.error('Error al cargar los ambientes:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchAmbientes();
    }, []);

    const pluralize = (word: string): string => {
        const specialPlurals: Record<string, string> = {
            TALLER: 'TALLERES',
        };
        return specialPlurals[word] || word + 'S';
    };    

    const generatePDF = () => {
        const doc = new jsPDF();
    
        // Encabezado principal del reporte
        doc.setFontSize(18);
        doc.text('REPORTE DE AMBIENTES', 105, 15, { align: 'center' });
        doc.setDrawColor(0, 0, 0); // Color negro para líneas
        doc.line(10, 20, 200, 20); // Línea decorativa
    
        let currentY = 30; // Coordenada Y inicial
        const pageHeight = doc.internal.pageSize.height; // Altura de la página
    
        Object.entries(ambientesPorEntidad).forEach(([entidad, ambientes]) => {
            if (currentY + 20 > pageHeight) {
                doc.addPage();
                currentY = 30;
            }
    
            // Crear tabla con encabezado de entidad
            autoTable(doc, {
                startY: currentY,
                body: [
                    // Encabezado de la entidad como parte de la tabla
                    [
                        {
                            content: entidad,
                            colSpan: 3,
                            styles: {
                                fillColor: [220, 220, 220], // Gris claro
                                textColor: 0, // Negro
                                halign: 'center' as const,
                                fontStyle: 'bold',
                            },
                        },
                    ],
                ],
                styles: { fontSize: 12, lineWidth: 0.2 },
                margin: { left: 10, right: 10 },
                tableWidth: 'auto',
                theme: 'grid',
            });
    
            currentY = doc.lastAutoTable.finalY + 10;
    
            [...new Set(ambientes.map((a) => pluralize(a.tipo_ambiente.toUpperCase())))].forEach((tipo) => {
                if (currentY + 15 > pageHeight) {
                    doc.addPage();
                    currentY = 30;
                }
    
                // Subencabezado del tipo de ambiente como parte de la tabla
                autoTable(doc, {
                    startY: currentY,
                    body: [
                        [
                            {
                                content: tipo,
                                colSpan: 3,
                                styles: {
                                    fillColor: [41, 128, 185], // Azul corporativo
                                    textColor: 255, // Blanco
                                    halign: 'center' as const,
                                    fontStyle: 'italic',
                                },
                            },
                        ],
                    ],
                    styles: { fontSize: 12, lineWidth: 0.2 },
                    margin: { left: 10, right: 10 },
                    tableWidth: 'auto',
                    theme: 'grid',
                });
    
                currentY = doc.lastAutoTable.finalY + 10;
    
                const ambientesPorTipo = ambientes.filter((a) => pluralize(a.tipo_ambiente.toUpperCase()) === tipo);
                const tableHeight = 10 + (ambientesPorTipo.length + 1) * 10; // Incluye encabezados
    
                if (currentY + tableHeight > pageHeight) {
                    doc.addPage();
                    currentY = 30;
                }
    
                // Crear la tabla con encabezado incluido como parte de la tabla
                autoTable(doc, {
                    startY: currentY,
                    body: [
                        // Encabezado de la tabla
                        [
                            { content: 'CÓDIGO', styles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' as const, fontStyle: 'bold' } },
                            { content: 'CAPACIDAD', styles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' as const, fontStyle: 'bold' } },
                            { content: 'RESPONSABLE', styles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' as const, fontStyle: 'bold' } },
                        ],
                        // Filas de datos
                        ...ambientesPorTipo.map((ambiente) => [
                            { content: ambiente.codigo, styles: { halign: 'center' as const } },
                            { content: ambiente.capacidad.toString(), styles: { halign: 'center' as const } },
                            { content: ambiente.encargado || 'N/A', styles: { halign: 'center' as const } },
                        ]),
                    ],
                    styles: { fontSize: 10, cellPadding: 4, lineWidth: 0.2 },
                    margin: { left: 10, right: 10 },
                    tableWidth: 'auto',
                    theme: 'grid',
                });
    
                // Actualizar posición Y después de la tabla
                currentY = doc.lastAutoTable.finalY + 10;
            });
        });
    
        // Guardar el archivo PDF
        doc.save('reporte_ambientes.pdf');
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div>
            <div className="card flex justify-content-between align-items-center mb-4 p-3">
                <h1 className="text-2xl font-bold text-center flex-grow-1">REPORTE DE AMBIENTES</h1>
                <button
                    onClick={generatePDF}
                    className="p-button p-component p-button-rounded p-button-danger"
                    title="Exportar PDF"
                >
                    <i className="pi pi-file-pdf text-lg" />
                </button>
            </div>

            {Object.entries(ambientesPorEntidad).map(([entidad, ambientes]) => (
                <div key={entidad} className="mb-5 card p-4">
                    <h2 className="text-2xl font-bold text-center mb-3">{entidad}</h2>
                    {[...new Set(ambientes.map((a) => pluralize(a.tipo_ambiente.toUpperCase())))].map((tipo) => (
                        <div key={tipo} className="mb-4">
                            <h3 className="text-lg font-semibold text-center mb-2">{tipo}</h3>
                            <DataTable
                                value={ambientes.filter((a) => pluralize(a.tipo_ambiente.toUpperCase()) === tipo)}
                                paginator
                                rows={5}
                                responsiveLayout="scroll"
                                className="p-datatable-sm"
                            >
                                <Column field="codigo" header="CÓDIGO" style={{ width: '30%' }} />
                                <Column field="capacidad" header="CAPACIDAD" style={{ width: '30%' }} />
                                <Column field="encargado" header="RESPONSABLE" style={{ width: '40%' }} />
                            </DataTable>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default ReporteAmbientes;