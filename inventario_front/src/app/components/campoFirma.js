import React, { useRef, forwardRef, useImperativeHandle ,useState} from 'react';
import SignatureCanvas from 'react-signature-canvas';

// 1. Asegúrate de que tu componente reciba 'props' y 'ref' como argumentos.
// 2. Asegúrate de que el componente esté envuelto en forwardRef().
const CamporFirma = forwardRef((props, ref) => {
    const sigCanvasRef = useRef({});
    const { firmaCambia } = props;

    // Este método se llamará cuando el usuario termine de dibujar
    const handleEnd = () => {
        if (firmaCambia) {
            const firma = sigCanvasRef.current.toDataURL('image/png');
            firmaCambia(firma); 
        }
    };
    const limpiar = () => {
        sigCanvasRef.current.clear();
    }
    return (
        <div>
            <SignatureCanvas
                ref={sigCanvasRef}
                canvasProps={{  className: 'sigCanvas componentefirma' }}
                onEnd={handleEnd}
            />
            <button type='button' onClick={limpiar}>Limpiar</button>
        </div>
    );

});

CamporFirma.displayName = 'CampoFirma';
// 3. Exporta el componente envuelto en forwardRef.
export default CamporFirma;