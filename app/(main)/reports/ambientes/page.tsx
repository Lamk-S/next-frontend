'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getAmbientesReporte } from '@/app/api/reportesApi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReporteAmbientes = () => {
    const [ambientes, setAmbientes] = useState<any[]>([]);
    const [filteredAmbientes, setFilteredAmbientes] = useState<any[]>([]);
    const [filtros, setFiltros] = useState({
        tipoEntidad: 'todos', // "todos", "escuelas", "departamentos"
        departamento: '',
        escuela: '',
        tipoAmbiente: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAmbientes = async () => {
            try {
                const data = await getAmbientesReporte();
                setAmbientes(data);
                setFilteredAmbientes(data); // Mostrar todos los datos inicialmente
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

    // Aplicar filtros automáticamente al cambiar filtros
    useEffect(() => {
        const { tipoEntidad, departamento, escuela, tipoAmbiente } = filtros;
        const filtered = ambientes.filter((ambiente) => {
            const esEscuela = Boolean(ambiente.escuela_nombre);
            const esDepartamento = Boolean(ambiente.departamento_nombre);

            return (
                // Filtrar por tipo de entidad
                (tipoEntidad === 'todos' ||
                    (tipoEntidad === 'escuelas' && esEscuela) ||
                    (tipoEntidad === 'departamentos' && esDepartamento)) &&
                // Filtrar por departamento
                (departamento ? ambiente.departamento_nombre === departamento : true) &&
                // Filtrar por escuela
                (escuela ? ambiente.escuela_nombre === escuela : true) &&
                // Filtrar por tipo de ambiente
                (tipoAmbiente ? ambiente.tipo_ambiente__nombre === tipoAmbiente : true)
            );
        });

        setFilteredAmbientes(filtered);
    }, [filtros, ambientes]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFiltros((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTipoEntidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFiltros((prev) => ({
            ...prev,
            tipoEntidad: e.target.value,
            departamento: '', // Reiniciar filtro de departamento
            escuela: '', // Reiniciar filtro de escuela
        }));
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('REPORTE DE AMBIENTES', 105, 15, { align: 'center' });
        doc.line(10, 20, 200, 20);

        let currentY = 30;
        const pageHeight = doc.internal.pageSize.height;

        const ambientesPorEntidad = filteredAmbientes.reduce((acc: Record<string, any[]>, ambiente) => {
            const entidad = ambiente.escuela_nombre
                ? `ESCUELA PROFESIONAL DE ${ambiente.escuela_nombre.toUpperCase()}`
                : ambiente.departamento_nombre
                ? `${ambiente.departamento_nombre.toUpperCase()}`
                : 'SIN ESCUELA/DEPARTAMENTO';

            if (!acc[entidad]) acc[entidad] = [];
            acc[entidad].push({
                ...ambiente,
                tipo_ambiente: ambiente.tipo_ambiente__nombre,
            });

            return acc;
        }, {});

        Object.entries(ambientesPorEntidad).forEach(([entidad, ambientes]) => {
            if (currentY + 20 > pageHeight) {
                doc.addPage();
                currentY = 30;
            }

            autoTable(doc, {
                startY: currentY,
                body: [
                    [
                        {
                            content: entidad,
                            colSpan: 3,
                            styles: {
                                fillColor: [220, 220, 220],
                                textColor: 0,
                                halign: 'center' as const,
                                fontStyle: 'bold',
                            },
                        },
                    ],
                ],
                styles: { fontSize: 12, lineWidth: 0.2 },
                theme: 'grid',
            });

            currentY = doc.lastAutoTable.finalY + 10;

            [...new Set(ambientes.map((a) => pluralize(a.tipo_ambiente.toUpperCase())))].forEach((tipo) => {
                if (currentY + 15 > pageHeight) {
                    doc.addPage();
                    currentY = 30;
                }

                autoTable(doc, {
                    startY: currentY,
                    body: [
                        [
                            {
                                content: tipo,
                                colSpan: 3,
                                styles: {
                                    fillColor: [41, 128, 185],
                                    textColor: 255,
                                    halign: 'center' as const,
                                    fontStyle: 'italic',
                                },
                            },
                        ],
                    ],
                    styles: { fontSize: 12, lineWidth: 0.2 },
                    theme: 'grid',
                });

                currentY = doc.lastAutoTable.finalY + 10;

                const ambientesPorTipo = ambientes.filter((a) => pluralize(a.tipo_ambiente.toUpperCase()) === tipo);

                autoTable(doc, {
                    startY: currentY,
                    body: [
                        [
                            { content: 'CÓDIGO', styles: { halign: 'center' as const, fontStyle: 'bold' } },
                            { content: 'CAPACIDAD', styles: { halign: 'center' as const, fontStyle: 'bold' } },
                            { content: 'RESPONSABLE', styles: { halign: 'center' as const, fontStyle: 'bold' } },
                        ],
                        ...ambientesPorTipo.map((ambiente) => [
                            { content: ambiente.codigo, styles: { halign: 'center' as const } },
                            { content: ambiente.capacidad.toString(), styles: { halign: 'center' as const } },
                            { content: ambiente.encargado || 'N/A', styles: { halign: 'center' as const } },
                        ]),
                    ],
                    styles: { fontSize: 10, cellPadding: 4, lineWidth: 0.2 },
                    margin: { left: 10, right: 10 },
                    theme: 'grid',
                });

                currentY = doc.lastAutoTable.finalY + 10;
            });
        });

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

            {/* Barra de filtros */}
            <div className="card mb-4 p-3 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <select name="tipoEntidad" onChange={handleTipoEntidadChange} className="p-inputtext p-component">
                    <option value="todos">Todas las Entidades</option>
                    <option value="escuelas">Solo Escuelas</option>
                    <option value="departamentos">Solo Departamentos</option>
                </select>
                {filtros.tipoEntidad === 'departamentos' && (
                    <select name="departamento" onChange={handleFilterChange} className="p-inputtext p-component">
                        <option value="">Todos los Departamentos</option>
                        {Array.from(new Set(ambientes.map((a) => a.departamento_nombre))).map((departamento) => (
                            <option key={departamento} value={departamento}>
                                {departamento}
                            </option>
                        ))}
                    </select>
                )}
                {filtros.tipoEntidad === 'escuelas' && (
                    <select name="escuela" onChange={handleFilterChange} className="p-inputtext p-component">
                        <option value="">Todas las Escuelas</option>
                        {Array.from(new Set(ambientes.map((a) => a.escuela_nombre))).map((escuela) => (
                            <option key={escuela} value={escuela}>
                                {escuela}
                            </option>
                        ))}
                    </select>
                )}
                <select name="tipoAmbiente" onChange={handleFilterChange} className="p-inputtext p-component">
                    <option value="">Todos los Tipos de Ambiente</option>
                    {Array.from(new Set(ambientes.map((a) => a.tipo_ambiente__nombre))).map((tipo) => (
                        <option key={tipo} value={tipo}>
                            {tipo}
                        </option>
                    ))}
                </select>
            </div>

            {/* Mostrar datos filtrados */}
            {Object.entries(
                filteredAmbientes.reduce((acc: Record<string, any[]>, ambiente) => {
                    const entidad = ambiente.escuela_nombre
                        ? `ESCUELA PROFESIONAL DE ${ambiente.escuela_nombre.toUpperCase()}`
                        : ambiente.departamento_nombre
                        ? `${ambiente.departamento_nombre.toUpperCase()}`
                        : 'SIN ESCUELA/DEPARTAMENTO';

                    if (!acc[entidad]) acc[entidad] = [];
                    acc[entidad].push(ambiente);
                    return acc;
                }, {})
            ).map(([entidad, ambientes]) => (
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