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
import { getTipoAmbientes, createTipoAmbiente, updateTipoAmbiente, deleteTipoAmbiente, TipoAmbiente } from '@/app/api/tipoAmbienteApi';
import { useRouter } from 'next/navigation';

const TipoAmbientePage = () => {
    const emptyTipoAmbiente: TipoAmbiente = { id: 0, nombre: '', descripcion: '' };

    const [tipoAmbientes, setTipoAmbientes] = useState<TipoAmbiente[]>([]);
    const [tipoAmbienteDialog, setTipoAmbienteDialog] = useState(false);
    const [deleteTipoAmbienteDialog, setDeleteTipoAmbienteDialog] = useState(false);
    const [tipoAmbiente, setTipoAmbiente] = useState<TipoAmbiente>(emptyTipoAmbiente);
    const [selectedTipoAmbientes, setSelectedTipoAmbientes] = useState<TipoAmbiente[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<TipoAmbiente[]>>(null); // Reference for DataTable export
    const router = useRouter();

    useEffect(() => {
        fetchTipoAmbientes();
    }, []);

    const fetchTipoAmbientes = async () => {
        try {
            const response = await getTipoAmbientes();
            setTipoAmbientes(response.data.results);  // Make sure this contains an array
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not load data.' });
        }
    };

    const openNew = () => {
        setTipoAmbiente(emptyTipoAmbiente);
        setSubmitted(false);
        setTipoAmbienteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setTipoAmbienteDialog(false);
    };

    const hideDeleteTipoAmbienteDialog = () => {
        setDeleteTipoAmbienteDialog(false);
    };

    const saveTipoAmbiente = async () => {
        setSubmitted(true);

        if (tipoAmbiente.nombre.trim()) {
            try {
                let updatedTipoAmbientes;
                if (tipoAmbiente.id) {
                    const response = await updateTipoAmbiente(tipoAmbiente.id, tipoAmbiente);
                    updatedTipoAmbientes = tipoAmbientes.map((ta) => (ta.id === response.data.id ? response.data : ta));
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Tipo Ambiente Updated', life: 3000 });
                } else {
                    const response = await createTipoAmbiente(tipoAmbiente);
                    updatedTipoAmbientes = [...tipoAmbientes, response.data];
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Tipo Ambiente Created', life: 3000 });
                }
                setTipoAmbientes(updatedTipoAmbientes);
                setTipoAmbienteDialog(false);
                setTipoAmbiente(emptyTipoAmbiente);
            } catch (error) {
                console.error("Error saving data:", error);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not save data.' });
            }
        }
    };

    const editTipoAmbiente = (tipoAmbiente: TipoAmbiente) => {
        setTipoAmbiente({ ...tipoAmbiente });
        setTipoAmbienteDialog(true);
    };

    const confirmDeleteTipoAmbiente = (tipoAmbiente: TipoAmbiente) => {
        setTipoAmbiente(tipoAmbiente);
        setDeleteTipoAmbienteDialog(true);
    };

    const deleteTipoAmbienteConfirmed = async () => {
        try {
            await deleteTipoAmbiente(tipoAmbiente.id!);
            setTipoAmbientes(tipoAmbientes.filter((ta) => ta.id !== tipoAmbiente.id));
            setDeleteTipoAmbienteDialog(false);
            setTipoAmbiente(emptyTipoAmbiente);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Tipo Ambiente Deleted', life: 3000 });
        } catch (error) {
            console.error("Error deleting data:", error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not delete data.' });
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setTipoAmbiente({ ...tipoAmbiente, [name]: val });
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteTipoAmbienteDialog(true);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="New" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedTipoAmbientes.length} />
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const tipoAmbienteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveTipoAmbiente} />
        </>
    );

    const deleteTipoAmbienteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteTipoAmbienteDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteTipoAmbienteConfirmed} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={tipoAmbientes}
                        selectionMode="multiple"
                        selection={selectedTipoAmbientes}
                        onSelectionChange={(e) => setSelectedTipoAmbientes(e.value as TipoAmbiente[])}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tipo ambientes"
                        globalFilter={globalFilter}
                        header={<h5 className="m-0">Manage Tipo Ambientes</h5>}
                        responsiveLayout="scroll"
                        emptyMessage="No data found."
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable></Column>
                        <Column field="descripcion" header="Descripción" sortable></Column>
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <>
                                    <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editTipoAmbiente(rowData)} />
                                    <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteTipoAmbiente(rowData)} />
                                </>
                            )}
                        ></Column>
                    </DataTable>

                    <Dialog visible={tipoAmbienteDialog} style={{ width: '450px' }} header="Tipo Ambiente Details" modal footer={tipoAmbienteDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={tipoAmbiente.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !tipoAmbiente.nombre })} />
                            {submitted && !tipoAmbiente.nombre && <small className="p-invalid">Name is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="descripcion">Descripción</label>
                            <InputText id="descripcion" value={tipoAmbiente.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} />
                        </div>
                    </Dialog>

                    <Dialog visible={deleteTipoAmbienteDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteTipoAmbienteDialogFooter} onHide={hideDeleteTipoAmbienteDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {tipoAmbiente && <span>Are you sure you want to delete <b>{tipoAmbiente.nombre}</b>?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default TipoAmbientePage;