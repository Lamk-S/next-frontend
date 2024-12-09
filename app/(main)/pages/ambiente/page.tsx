'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import axios, { AxiosError } from 'axios';
import { getAmbientes, createAmbiente, updateAmbiente, deleteAmbiente, Ambiente} from '@/app/api/ambienteApi';
import { getTipoAmbientes} from '@/app/api/tipoAmbienteApi';
import { getEdificios} from '@/app/api/edificioApi';
import { getEscuelas, getDepartamentos, Departamento, Escuela} from '@/app/api/auxiliarApi';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';

const AmbientePage = () => {
    
    interface TipoAmbiente {
        id: number;
        nombre: string;
        descripcion: string;
    }

    interface Edificio {
        id: number;
        nombre: string;
        descripcion: string;
        pisos: number;
        ubicacion_lat: number;
        ubicacion_lng: number;
    }

    interface Ambiente1 {
        id: number;
        codigo: string;
        escuela: Escuela | null; // Si `escuela` tiene una estructura específica, defínela; en caso contrario, usa `any | null`.
        departamento: Departamento | null;
        capacidad: number;
        piso: number | null;
        encargado: string;
        edificio: Edificio | null;
        tipo_ambiente: TipoAmbiente | null;
    }

    const emptyAmbiente: Ambiente = {
        id: 0,
        codigo: '',
        tipo_ambiente_id: null, // Almacena solo el ID
        escuela_id: null, // Puede ser null si no está relacionado
        departamento_id: null, // Puede ser null si no está relacionado
        edificio_id: null,
        piso: 0,
        encargado: '',
        capacidad: 0,
    };

    const [ambientes, setAmbientes] = useState<Ambiente1[]>([]);
    const [escuelas, setEscuelas] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [edificios, setEdificios] = useState<Edificio[]>([]);
    const [ambienteDialog, setAmbienteDialog] = useState(false);
    const [deleteAmbienteDialog, setDeleteAmbienteDialog] = useState(false);
    const [ambiente, setAmbiente] = useState<Ambiente>(emptyAmbiente);
    const [tipoAmbientes, setTipoAmbientes] = useState([]); // Nuevo estado para TipoAmbientes
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Ambiente1[]>>(null); // Reference for DataTable export
    const [selectedType, setSelectedType] = useState<'escuela' | 'departamento' | ''>(''); // Estado para el tipo seleccionado
    const [floorOptions, setFloorOptions] = useState<number[]>([]); // Opciones dinámicas de pisos

    const handleTypeChange = (e: any) => {
        setSelectedType(e.target.value); // Actualizar el estado según el radio seleccionado
        setAmbiente({ ...ambiente, escuela_id: null, departamento_id: null }); // Limpiar los valores al cambiar
    };

    const handleBuildingChange = (e: { value: any }) => {
        const selectedBuildingId = e.value;
        const selectedBuilding = edificios.find((edificio) => edificio.id === selectedBuildingId);

        setAmbiente({
            ...ambiente,
            edificio_id: selectedBuildingId,
            piso: null, // Reinicia el piso al cambiar de edificio
        });

        if (selectedBuilding) {
            // Generar las opciones de piso dinámicamente
            const floors = Array.from({ length: selectedBuilding.pisos }, (_, index) => index + 1);
            setFloorOptions(floors);
        } else {
            setFloorOptions([]); // Limpia las opciones de piso si no hay edificio seleccionado
        }
    };

    useEffect(() => {
        fetchAmbientes();
        fetchAuxiliaryData();
    }, []);

    const fetchAmbientes = async () => {
        try {
            const response = await getAmbientes();
            setAmbientes(response.data.results); // Asegúrate de que `results` contiene un array
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Could not load ambientes.',
            });
        }
    };

    const fetchAuxiliaryData = async () => {
        try {
            const [escuelasRes, departamentosRes, tipoAmbientesRes, edificiosRes] = await Promise.all([getEscuelas(), getDepartamentos(), getTipoAmbientes(), getEdificios()]);
            setEscuelas(escuelasRes.data.results); // Ajusta según la estructura de respuesta
            setDepartamentos(departamentosRes.data.results); // Ajusta según la estructura de respuesta
            setTipoAmbientes(tipoAmbientesRes.data.results);
            setEdificios(edificiosRes.data);
        } catch (error) {
            console.error('Error fetching auxiliary data:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Could not load auxiliary data.',
            });
        }
    };

    const openNew = () => {
        setAmbiente(emptyAmbiente);
        setSubmitted(false);
        setAmbienteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setAmbienteDialog(false);
    };

    const hideDeleteAmbienteDialog = () => {
        setDeleteAmbienteDialog(false);
    };

    const saveAmbiente = async () => {
        setSubmitted(true);
        if (ambiente.codigo.trim() && ambiente.tipo_ambiente_id) {
            try {
                let updatedAmbientes;
                if (ambiente.id) {
                    const response = await updateAmbiente(ambiente.id, ambiente);
                    updatedAmbientes = ambientes.map((a) => (a.id === response.data.id ? response.data : a));
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Ambiente Updated',
                        life: 3000,
                    });
                } else {
                    const response = await createAmbiente(ambiente);
                    updatedAmbientes = [...ambientes, response.data];
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Ambiente Created',
                        life: 3000,
                    });
                }
                setAmbientes(updatedAmbientes);
                setAmbienteDialog(false);
                setAmbiente(emptyAmbiente);
            } catch (error) {
                console.error('Error saving data:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Could not save data.',
                });
            }
        }
    };

    const transformAmbiente1ToAmbiente = (ambiente1: Ambiente1): Ambiente => {
        return {
            id: ambiente1.id,
            codigo: ambiente1.codigo,
            tipo_ambiente_id: ambiente1.tipo_ambiente ? ambiente1.tipo_ambiente.id : null, // Extrae solo el ID
            escuela_id: ambiente1.escuela ? ambiente1.escuela.id : null, // Extrae solo el ID
            departamento_id: ambiente1.departamento ? ambiente1.departamento.id : null, // Extrae solo el ID
            edificio_id: ambiente1.edificio ? ambiente1.edificio.id : null,
            capacidad: ambiente1.capacidad,
            piso: ambiente1.piso,
            encargado: ambiente1.encargado,
        };
    };

    const editAmbiente = (ambiente: Ambiente1) => {
        const transformedAmbiente = transformAmbiente1ToAmbiente(ambiente);
        setAmbiente(transformedAmbiente);
        setAmbienteDialog(true);
    };

    const confirmDeleteAmbiente = (ambiente: Ambiente1) => {
        const transformedAmbiente = transformAmbiente1ToAmbiente(ambiente);
        setAmbiente(transformedAmbiente);
        setDeleteAmbienteDialog(true);
    };

    const deleteAmbienteConfirmed = async () => {
        try {
            await deleteAmbiente(ambiente.id!);
            setAmbientes(ambientes.filter((a) => a.id !== ambiente.id));
            setDeleteAmbienteDialog(false);
            setAmbiente(emptyAmbiente);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Ambiente Deleted',
                life: 3000,
            });
        } catch (error) {
            console.error('Error deleting data:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Could not delete data.',
            });
        }
    };

    const onInputChange = (e: any, name: string) => {
        const val = e.value !== undefined ? e.value : e.target.value; // Maneja ambos casos
        setAmbiente({ ...ambiente, [name]: val });
    };

    const onDropdownChange = (e: { value: any }, name: string) => {
        setAmbiente({ ...ambiente, [name]: e.value });
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };


    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {/* <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" /> */}
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const ambienteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveAmbiente} />
        </>
    );

    const deleteAmbienteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteAmbienteDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteAmbienteConfirmed} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar
                        className="mb-4"
                        right={rightToolbarTemplate}
                        left={<Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />}
                    ></Toolbar>

                    <DataTable
                        ref={dt}
                        value={ambientes}
                        dataKey="id"
                        paginator
                        rows={10}
                        className="datatable-responsive"
                        responsiveLayout="scroll"
                        emptyMessage="No data found."
                    >
                        <Column field="codigo" header="Código" sortable></Column>
                        <Column field="tipo_ambiente.nombre" header="Tipo Ambiente" sortable></Column>
                        {/* <Column field="escuela.nombre" header="Escuela" sortable></Column> */}
                        <Column field="departamento.departamento" header="Departamento" sortable></Column>
                        <Column field="capacidad" header="Capacidad" sortable></Column>
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <>
                                    <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editAmbiente(rowData)} />
                                    <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteAmbiente(rowData)} />
                                </>
                            )}
                        ></Column>
                    </DataTable>

                    <Dialog
                        visible={ambienteDialog}
                        style={{ width: '450px' }}
                        header="Ambiente Details"
                        modal
                        footer={ambienteDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="codigo">Código</label>
                            <InputText id="codigo" value={ambiente.codigo} onChange={(e) => onInputChange(e, 'codigo')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="tipo_ambiente">Tipo Ambiente</label>
                            <Dropdown
                                id="tipo_ambiente"
                                value={ambiente.tipo_ambiente_id}
                                options={tipoAmbientes}
                                onChange={(e) => onDropdownChange(e, 'tipo_ambiente_id')}
                                optionLabel="nombre"
                                optionValue="id"
                                placeholder="Select Tipo Ambiente"
                            />
                        </div>
                        {/* Radio botones para elegir entre Escuela o Departamento */}
                        <div className="field">
                            <label>Tipo de Pertenencia:</label>
                            <div className="flex align-items-center">
                                <div className="mr-3">
                                    <input
                                        type="radio"
                                        id="escuela"
                                        name="type"
                                        value="escuela"
                                        onChange={handleTypeChange}
                                        checked={selectedType === 'escuela'}
                                    />
                                    <label htmlFor="escuela" className="ml-2">
                                        Escuela
                                    </label>
                                </div>
                                <div>
                                    <input
                                        type="radio"
                                        id="departamento"
                                        name="type"
                                        value="departamento"
                                        onChange={handleTypeChange}
                                        checked={selectedType === 'departamento'}
                                    />
                                    <label htmlFor="departamento" className="ml-2">
                                        Departamento
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Mostrar Dropdown de Escuela solo si "Escuela" está seleccionado */}
                        {selectedType === 'escuela' && (
                            <div className="field">
                                <label htmlFor="escuela">Escuela</label>
                                <Dropdown
                                    id="escuela"
                                    value={ambiente.escuela_id}
                                    options={escuelas}
                                    onChange={(e) => onDropdownChange(e, 'escuela_id')}
                                    optionLabel="programa_de_estudios.programa_de_estudios"
                                    placeholder="Select Escuela"
                                    optionValue="id"
                                />
                            </div>
                        )}

                        {/* Mostrar Dropdown de Departamento solo si "Departamento" está seleccionado */}
                        {selectedType === 'departamento' && (
                            <div className="field">
                                <label htmlFor="departamento">Departamento</label>
                                <Dropdown
                                    id="departamento"
                                    value={ambiente.departamento_id}
                                    options={departamentos}
                                    onChange={(e) => onDropdownChange(e, 'departamento_id')}
                                    optionLabel="departamento"
                                    placeholder="Select Departamento"
                                    optionValue="id"
                                />
                            </div>
                        )}
                        {/* Dropdown de Edificio */}
                        <div className="field">
                            <label htmlFor="edificio">Edificio</label>
                            <Dropdown
                                id="edificio"
                                value={ambiente.edificio_id}
                                options={edificios}
                                onChange={handleBuildingChange}
                                optionLabel="nombre"
                                optionValue="id"
                                placeholder="Select Edificio"
                            />
                        </div>

                        {/* Dropdown de Piso (visible solo si hay un edificio seleccionado) */}
                        {ambiente.edificio_id && (
                            <div className="field">
                                <label htmlFor="piso">Piso</label>
                                <Dropdown
                                    id="piso"
                                    value={ambiente.piso}
                                    options={floorOptions}
                                    onChange={(e) => onDropdownChange(e, 'piso')}
                                    placeholder="Select Piso"
                                />
                            </div>
                        )}
                        <div className="field">
                            <label htmlFor="capacidad">Capacidad</label>
                            <InputNumber id="capacidad" value={ambiente.capacidad} onValueChange={(e) => onInputChange(e, 'capacidad')} showButtons required />
                        </div>
                        <div className="field">
                            <label htmlFor="encargado">Encargado:</label>
                            <InputText id="encargado" value={ambiente.encargado} onChange={(e) => onInputChange(e, 'encargado')} required style={{ width: '80%' }}/>
                        </div>
                    </Dialog>
                    <Dialog visible={deleteAmbienteDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteAmbienteDialogFooter} onHide={hideDeleteAmbienteDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {ambiente && <span>Are you sure you want to delete <b>{ambiente.codigo}</b>?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default AmbientePage;