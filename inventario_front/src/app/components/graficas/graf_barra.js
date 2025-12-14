// src/components/GraficoDeBarras.jsx
'use client';
import React, { PureComponent } from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function GraficoDeBarras({ data, xAxisDataKey, barDataKey, barName, title }) {
    // Validaciones básicas de props, igual que antes
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: '#555' }}>
                <p>No hay datos disponibles para la gráfica de {title || 'este tipo'}.</p>
            </div>
        );
    }
    const testData = [
  { cantidad: 4, sub_area: "Contabilidad" },
  { cantidad: 5, sub_area: "TIC" },
  { cantidad: 2, sub_area: "RRHH" },
  { cantidad: 12, sub_area: "MM" },
  { cantidad: 12, sub_area: "MEM" },
];
    console.log(data);
    return (
        <div style={{ marginBottom: '40px', border: '1px solid #eee', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            {title && <h2>{title}</h2>} {/* Muestra el título si se proporciona */}
            <ResponsiveContainer width={600} height={300}>
                <BarChart
                width={500}
                height={300}
                data={testData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sub_area" />
                <YAxis />
                <Tooltip />
                
                <Bar dataKey="cantidad" fill="#8884d8" barSize={30} activeBar={<Rectangle fill="pink" stroke="blue" />} />
                
                </BarChart>
            </ResponsiveContainer>
           
        </div>
    );
}

export default GraficoDeBarras;