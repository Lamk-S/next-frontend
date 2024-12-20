/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Mantenedores',
            icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
                {
                    label: 'Tipo Ambiente',
                    icon: 'pi pi-fw pi-cog',
                    to: '/pages/tipoambiente'
                },
                {
                    label: 'Ambientes',
                    icon: 'pi pi-fw pi-cog',
                    to: '/pages/ambiente'
                },
                {
                    label: 'Tipo Activo',
                    icon: 'pi pi-fw pi-cog',
                    to: '/pages/tipoactivo' 
                },
                {
                    label: 'Activos',
                    icon: 'pi pi-fw pi-cog',
                    to: '/pages/activo'
                },
                {
                    label: 'Edificios',
                    icon: 'pi pi-fw pi-cog',
                    to: '/pages/edificio'
                },
            ]
        },
        {
            label: 'Reportes',
            icon: 'pi pi-fw pi-file',
            to: '/reports',
            items: [
                {
                    label: 'Reporte de Ambientes',
                    icon: 'pi pi-fw pi-file-pdf',
                    to: '/reports/ambientes'
                }
            ]
        },
        {
            label: 'Mapeo',
            icon: 'pi pi-fw pi-file',
            to: '/explore',
            items: [
                {
                    label: 'Activos',
                    icon: 'pi pi-fw pi-th-large',
                    to: '/explore'
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
