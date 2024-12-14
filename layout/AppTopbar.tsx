/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { Menu } from 'primereact/menu';
import { logout } from '@/app/api/authApi'; // Importar la función de logout

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);

    // Menú del submenú "Profile"
    const profileMenuRef = useRef<Menu>(null);

    // Opciones del submenú "Profile"
    const profileMenuItems = [
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => {
                logout();
                window.location.href = '/auth/login'; // Redirigir al usuario a la página de login
            }
        }
    ];

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo-facing.webp`} width="47.22px" height={'35px'} alt="logo" />
                <span>FACING</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-calendar"></i>
                    <span>Calendar</span>
                </button>
                {/* Submenú para Profile */}
                <div>
                    <button
                        type="button"
                        className="p-link layout-topbar-button"
                        onClick={(event) => profileMenuRef.current?.toggle(event)}
                    >
                        <i className="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                    <Menu model={profileMenuItems} popup ref={profileMenuRef} />
                </div>
                <Link href="#">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-cog"></i>
                        <span>Settings</span>
                    </button>
                </Link>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
