'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { getTipoActivos, createTipoActivo, updateTipoActivo, deleteTipoActivo, TipoActivo } from '@/app/api/tipoActivoApi';

const TipoActivoPage: React.FC = () => {
    const emptyTipoActivo: TipoActivo = { id: 0, nombre: '', descripcion: '' };

    const [tipoActivos, setTipoActivos] = useState<TipoActivo[]>([]);
    const [tipoActivoDialog, setTipoActivoDialog] = useState(false);
    const [deleteTipoActivoDialog, setDeleteTipoActivoDialog] = useState(false);
    const [tipoActivo, setTipoActivo] = useState<TipoActivo>(emptyTipoActivo);
    const [submitted, setSubmitted] = useState(false);
    const dt = useRef<DataTable<TipoActivo[]>>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetchTipoActivos();
    }, []);

    const fetchTipoActivos = async () => {
        try {
            const response = await getTipoActivos();
            setTipoActivos(response.data);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not load data.' });
        }
    };

    const openNew = () => {
        setTipoActivo(emptyTipoActivo);
        setSubmitted(false);
        setTipoActivoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setTipoActivoDialog(false);
    };

    const saveTipoActivo = async () => {
        setSubmitted(true);

        if (tipoActivo.nombre.trim()) {
            try {
                let updatedTipoActivos;
                if (tipoActivo.id) {
                    const response = await updateTipoActivo(tipoActivo.id, tipoActivo);
                    updatedTipoActivos = tipoActivos.map((ta) => (ta.id === response.data.id ? response.data : ta));
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Tipo Activo Updated' });
                } else {
                    const response = await createTipoActivo(tipoActivo);
                    updatedTipoActivos = [...tipoActivos, response.data];
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Tipo Activo Created' });
                }
                setTipoActivos(updatedTipoActivos);
                setTipoActivoDialog(false);
                setTipoActivo(emptyTipoActivo);
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not save data.' });
            }
        }
    };

    const editTipoActivo = (tipoActivo: TipoActivo) => {
        setTipoActivo({ ...tipoActivo });
        setTipoActivoDialog(true);
    };

    const confirmDeleteTipoActivo = (tipoActivo: TipoActivo) => {
        setTipoActivo(tipoActivo);
        setDeleteTipoActivoDialog(true);
    };

    const deleteTipoActivoConfirmed = async () => {
        try {
            await deleteTipoActivo(tipoActivo.id!);
            setTipoActivos(tipoActivos.filter((ta) => ta.id !== tipoActivo.id));
            setDeleteTipoActivoDialog(false);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Tipo Activo Deleted' });
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not delete data.' });
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setTipoActivo({ ...tipoActivo, [name]: val });
    };
    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const hideDeleteTipoActivoDialog = () => {
        setDeleteTipoActivoDialog(false);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {/* <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" /> */}
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const deleteTipoActivoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteTipoActivoDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteTipoActivoConfirmed} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar
                        className="mb-4"
                        left={<Button label="New" icon="pi pi-plus" className="mr-2" onClick={openNew} />}
                        right={rightToolbarTemplate}
                    />
                    <DataTable
                        ref={dt}
                        value={tipoActivos}
                        dataKey="id"
                        paginator
                        rows={10}
                        className="datatable-responsive"
                        responsiveLayout="scroll"
                        emptyMessage="No data found."
                    >
                        <Column field="nombre" header="Nombre" sortable/>
                        <Column field="descripcion" header="Descripción" sortable/>
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <>
                                    <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editTipoActivo(rowData)} />
                                    <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteTipoActivo(rowData)} />
                                </>
                            )}
                        />
                    </DataTable>
                    <Dialog
                        visible={tipoActivoDialog}
                        header="Tipo Activo Details"
                        modal
                        onHide={hideDialog}
                        footer={
                            <>
                                <Button label="Cancel" icon="pi pi-times" onClick={hideDialog} />
                                <Button label="Save" icon="pi pi-check" onClick={saveTipoActivo} />
                            </>
                        }
                    >
                        <div>
                            <label>Nombre</label>
                            <InputText
                                value={tipoActivo.nombre}
                                onChange={(e) => onInputChange(e, 'nombre')}
                            />
                        </div>
                        <div>
                            <label>Descripción</label>
                            <InputText
                                value={tipoActivo.descripcion}
                                onChange={(e) => onInputChange(e, 'descripcion')}
                            />
                        </div>
                    </Dialog>
                    <Dialog visible={deleteTipoActivoDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteTipoActivoDialogFooter} onHide={hideDeleteTipoActivoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {tipoActivo && <span>Are you sure you want to delete <b>{tipoActivo.nombre}</b>?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default TipoActivoPage;
