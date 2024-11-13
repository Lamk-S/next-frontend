/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useContext } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { useAuth } from '../../../context/AuthContext';
import { LayoutContext } from '../../../../layout/context/layoutcontext';

const LoginPage = () => {
    const { loginUser } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Estado para el mensaje de error
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = await loginUser(username, password);
        if (error) {
            setErrorMessage(error); // Muestra el mensaje de error si hay problemas
        } else {
            setErrorMessage(null); // Resetea el mensaje de error si el login es exitoso
        }
    };

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img
                    src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`}
                    alt="Sakai logo"
                    className="mb-5 w-6rem flex-shrink-0"
                />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <img src="/demo/images/login/avatar.png" alt="Image" height="50" className="mb-3" />
                            <div className="text-900 text-3xl font-medium mb-3">Welcome, Isabel!</div>
                            <span className="text-600 font-medium">Sign in to continue</span>
                        </div>

                        <form onSubmit={handleLogin}>
                            <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                                Username
                            </label>
                            <InputText
                                id="username"
                                type="text"
                                placeholder="Username"
                                className="w-full md:w-30rem mb-5"
                                style={{ padding: '1rem' }}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />

                            <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <Password
                                inputId="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                toggleMask
                                className="w-full mb-5"
                                inputClassName="w-full p-3 md:w-30rem"
                                required
                            />

                            {errorMessage && <p className="text-red-500 mb-5">{errorMessage}</p>} {/* Muestra el mensaje de error */}

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputId="rememberme"
                                        checked={checked}
                                        onChange={(e) => setChecked(e.checked ?? false)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="rememberme">Remember me</label>
                                </div>
                                <a
                                    className="font-medium no-underline ml-2 text-right cursor-pointer"
                                    style={{ color: 'var(--primary-color)' }}
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <Button label="Sign In" type="submit" className="w-full p-3 text-xl"></Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;