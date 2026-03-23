import React, { useState } from 'react';

interface LoginProps {
    onLogin: (user: any) => void;
    onCancel: () => void;
}

export default function Login({ onLogin, onCancel }: LoginProps) {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');

        try {
            const response = await fetch(`http://localhost:8000/api/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });
            const user = await response.json();

            if (response.ok && user.email) {
                setShowSuccess(true);
                // Wait for 1.5s before proceeding to the dashboard
                setTimeout(() => {
                    if (onLogin) onLogin(user);
                }, 1500);
            } else {
                setLoginError(user.message || 'Invalid Credentials. Please try again.');
            }
        } catch (error) {
            setLoginError('Cannot connect to server. Check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-[#061a40] p-[15px] font-['Inter',_sans-serif] transition-colors duration-500">
            {/* Background Decor */}
            <div
                className="absolute w-[150%] h-[150%] opacity-[0.08] blur-[10px] z-1 animate-[rotate_100s_linear_infinite]"
                style={{
                    backgroundImage: "url('/dict.png')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain'
                }}
            ></div>

            {/* Admin Form Card */}
            <div className="relative z-10 w-full max-w-[380px] bg-white dark:bg-slate-900 backdrop-blur-[15px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] rounded-[1.5rem] overflow-hidden border border-slate-100 dark:border-white/10 transition-colors">

                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <i className="fas fa-times-circle text-xl"></i>
                </button>

                <div className="pt-8 pb-2 text-center px-6">
                    <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <img src="/dict.png" alt="DICT Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-xl font-[900] tracking-tight uppercase text-[#061a40] dark:text-white">
                        Admin Access
                    </h2>
                    <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.3em] mt-1">Authorized Personnel Only</p>
                </div>

                <div className="px-8 pb-10 pt-4">
                    <form onSubmit={handleSignIn} className="space-y-4">
                        {loginError && (
                            <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <i className="fas fa-exclamation-circle text-rose-500 text-xs"></i>
                                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">{loginError}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Administrator Email</label>
                            <div className="relative">
                                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
                                <input
                                    type="email" required
                                    className="block w-full pl-10 pr-4 py-3 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all font-medium"
                                    placeholder="admin@dict.gov.ph"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Security Password</label>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
                                <input
                                    type={showPassword ? "text" : "password"} required
                                    className="block w-full pl-10 pr-12 py-3 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all font-medium"
                                    placeholder="••••••••"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 font-bold text-[10px] uppercase tracking-widest bg-gray-100 hover:bg-blue-50 px-2 py-1 rounded transition-colors focus:outline-none"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || showSuccess}
                            className={`w-full bg-[#061a40] dark:bg-blue-600 hover:bg-[#1e40af] dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest mt-4 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <i className="fas fa-spinner animate-spin"></i>
                            ) : (
                                <i className="fas fa-shield-alt"></i>
                            )}
                            {isLoading ? 'Verifying...' : 'Authenticate'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
                        <p className="text-center text-[9px] text-gray-400 leading-relaxed italic">
                            Access to this system is monitored. Unauthorized attempts will be logged and reported.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- SUCCESS MODAL --- */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#061a40]/90 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 text-center border-t-8 border-[#00AEEF] transform animate-in zoom-in slide-in-from-bottom-10 duration-500">
                        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                            <div className="absolute inset-0 bg-[#00AEEF] rounded-full animate-ping opacity-20"></div>
                            <i className="fas fa-check-circle text-[3.5rem] text-[#00AEEF] relative z-10"></i>
                        </div>

                        <h3 className="text-2xl font-black text-[#003366] dark:text-white uppercase tracking-tighter mb-2 italic">Authentication Success</h3>
                        <div className="h-1 w-12 bg-[#00AEEF] mx-auto mb-6"></div>

                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            Welcome back, Administrator.<br />Redirecting to Security Dashboard...
                        </p>

                        <div className="mt-8 flex justify-center gap-1.5">
                            <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
