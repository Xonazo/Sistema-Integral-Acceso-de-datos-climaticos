import React, { useState } from 'react';

function Tabs() {
    const [activeTab, setActiveTab] = useState('singlePoint'); // Estado para controlar el tab activo
    const [startDate, setStartDate] = useState('');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <>
            <div className="space-y-5">
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-1">
                    <ul className="flex items-center gap-2 text-sm font-medium">
                        <li className="flex-1">
                            <a
                                onClick={() => handleTabClick('singlePoint')}
                                className={`text-gray-700 relative flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 shadow ${activeTab === 'singlePoint' && 'bg-blue-500 text-white'
                                    }`}
                            >
                                Single Point
                            </a>
                        </li>
                        <li className="flex-1">
                            <a
                                onClick={() => handleTabClick('zone')}
                                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow ${activeTab === 'zone' && 'bg-blue-500 text-white'
                                    }`}
                            >
                                Zone
                            </a>
                        </li>
                        <li className="flex-1">
                            <a
                                onClick={() => handleTabClick('graficos')}
                                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow ${activeTab === 'graficos' && 'bg-blue-500 text-white'
                                    }`}
                            >
                                Graficos
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {activeTab === 'singlePoint' && (
                <div className="bg-blue-100 flex items-center p-4">
                    {/* Contenido del tab 'Single Point' aquí */}
                    <form>
                        {/* ... */}
                    </form>
                </div>
            )}

            {activeTab === 'zone' && (
                <div className="bg-green-100 flex items-center p-4">
                    {/* Contenido del tab 'Zone' aquí */}
                </div>
            )}

            {activeTab === 'graficos' && (
                <div className="bg-yellow-100 flex items-center p-4">
                    {/* Contenido del tab 'Graficos' aquí */}
                </div>
            )}
        </>
    );
}

export default Tabs;
