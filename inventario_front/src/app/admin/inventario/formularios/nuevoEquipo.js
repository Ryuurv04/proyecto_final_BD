
import React, { useState, forwardRef, useImperativeHandle,useEffect } from 'react';
import TipoEquipo from '../../../components/imputs/tipoEquipo';
import Proveedor from '../../../components/imputs/proveedor';
import EspecificacionesSelect from '../../../components/imputs/selectEspecificaiones';
import API_URL from '@/config/apiConfig';

const AddEquipoForm = forwardRef(( {onSubmit, initialData = {},accion,usuario} , ref) => {
    const [formData, setFormData] = useState({
        tipo: initialData.tipo || '',
        cod_equipo: initialData.cod_equipo || '',
        serie: initialData.serie || '', 
        marbete: initialData.marbete || '', 
        garantia: initialData.garantia_meses || '',
        estado: initialData.estado_valor || 'A',
        proveedor: initialData.cod_proveedor || '',
        fecha: initialData.fecha_recepcion|| new Date().toISOString().split('T')[0],
        usuario: usuario.cod_usuario
    });
    const [errors, setErrors] = useState({}); // Para validación de formulario
    const [disable,setDisable]=useState(false);
    const [camposExtrasRender, setCamposExtrasRender] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (accion === 'E') {
            setDisable(true); // Deshabilita los campos si la acción es 'E' (Editar)
        } else {
            setDisable(false); // Habilita los campos para otras acciones (ej. 'A' de Añadir)
        }
        
    }, [accion]);
    // Permite que el componente padre (SweetAlert) acceda a los datos del formulario
    useImperativeHandle(ref, () => ({
        getFormData: () => formData,
        validate: () => {
            const newErrors = {};
            if(accion === "I"){
                
                for (const key in formData) {
                    if (Object.hasOwnProperty.call(formData, key)) {
                        const value = formData[key];

                        // Si el valor es un string directo
                        if (typeof value === 'string' && value.trim() === '') {
                            newErrors[key] = `El campo ${key} es requerido.`;
                        }

                        // Si es un objeto con propiedad "valor"
                        else if (typeof value === 'object' && value !== null && 'valor' in value) {
                            if (value.valor === null || value.valor === undefined || value.valor.toString().trim() === '') {
                            newErrors[key] = `El campo ${key} es requerido.`;
                            }
                        }

                        // Si es null o undefined
                        else if (value === null || value === undefined) {
                            newErrors[key] = `El campo ${key} es requerido.`;
                        }
                    }
                    console.log(newErrors)
                }
                
            }else{
                if (!formData.cod_equipo) newErrors.cod_equipo = 'Error';
            }
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return false;
            }
            setErrors({});
            return true;
        }
    }));

    const cambioTipoEquipo = (selectTipoEquipo) => {
         setFormData(prevData => ({
            ...prevData,
            tipo: selectTipoEquipo,
             
        }));
        setErrors(prevErrors => ({ ...prevErrors, tipo: '' })); // Limpiar error al seleccionar
        espesificaciones(selectTipoEquipo);
    };
    const cambioProveedor = (selectProveedor) => {
         setFormData(prevData => ({
            ...prevData,
            proveedor: selectProveedor,
             
        }));
        setErrors(prevErrors => ({ ...prevErrors, proveedor: '' })); // Limpiar error al seleccionar
    };
    
    const cambioEstandar = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
           
        }));
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' })); // Limpiar error al seleccionar
    };
    //busca los campos por tipo de equipo
    const espesificaciones = async(tipo)=>{
        if(!tipo) return;
         try {
            const res = await fetch(`${API_URL}/tipoequipo/${tipo}/espesificaciones`);
            const data = await res.json();

            
            const extraArray = data || [];
            const camposExtras = extraArray.reduce((acc, curr) => {
                acc[curr.nombre] = {
                    "cod_especificacion": curr.cod_especificacion,                    
                    valor:''
                };
                return acc;
            }, {});

              // Campos base
            let camposBase = {
                tipo: tipo,                
                proveedor: formData.proveedor || '',
                serie: formData.serie || '',
                marbete: formData.marbete ||'',
                garantia: formData.garantia ||'',
                estado: formData.estado ||'A',
                fecha: new Date(formData.fecha).toISOString().split('T')[0],
                cod_usuario: usuario.cod_usuario,
            };
            if(accion !== 'I'){
                camposBase ={
                    ...camposBase,
                    cod_equipo: formData.cod_equipo || '',
                }
            }
            // Actualizamos formData limpio
            setFormData({
            ...camposBase,
            ...camposExtras,
            });
            setCamposExtrasRender(extraArray);
            
        } catch (error) {
            console.error("Error al cargar campos extra:", error);
        }

    }
    //genera las especificaciones si hay datos
    useEffect(() => {
        const tipo = formData.tipo;
        if(!tipo) return;
        const cargarEspecificaiones = async () => {
            setLoading(true);
            await espesificaciones(tipo);  // Espera a que termine antes de continuar
            setLoading(false);
        };

        cargarEspecificaiones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);
    
    // Función de envío, pero será llamada por SweetAlert, no por un botón de submit directo
    const handleLocalSubmit = () => {
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    if (loading) {
        return <p>Cargando Formulario...</p>;
    }

    return (
        <div className="md:p-4 p-6 text-left md:grid md:grid-cols-3 md:gap-4 flex flex-col gap-2">

            {/* Otros campos del formulario */}
            <div className="mb-4 ">
                <label className=" text-gray-700 mb-2">Tipo de Equipo</label>
                <TipoEquipo onSelectTipo={cambioTipoEquipo} selectedTipo={formData.tipo} accionTipo={accion}/>
                {errors.tipo && <p className="text-red-500 text-xs italic">{errors.tipo}</p>}
            </div>
            <div className="mb-4">
                <label className=" text-gray-700 mb-2">Proveedor</label>
                <Proveedor onChange={cambioProveedor} selected={formData.proveedor} />
                {errors.proveedor && <p className="text-red-500 text-xs italic">{errors.proveedor}</p>}
            </div>
             <div className="mb-4">
                <label>Estado</label>
                <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={cambioEstandar}
                    disabled = {formData.estado === 'S' ? true : false}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                >
                    <option value="D">Descarte</option>
                    <option value="A">Activo</option>
                    <option value="M">Mantenimiento</option>
                    {accion === 'E' & formData.estado === 'S'? 
                        <option value="S">Asignado</option> 
                       :''
                    }
                </select>
             </div>
             <div className="mb-4">
                <label className=" text-gray-700 mb-2">N/Serie</label>
                <input
                    type="text"
                    id="serie"
                    name="serie"
                    value={formData.serie}
                    onChange={cambioEstandar}
                     className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.serie ? 'border-red-500' : ''}`}
                    
                    required
                />
                {errors.serie && <p className="text-red-500 text-xs italic">{errors.serie}</p>}
            </div>
             <div className="mb-4">
                <label className=" text-gray-700 mb-2">Marbete</label>
                <input
                    type="text"
                    id="marbete"
                    name="marbete"
                    value={formData.marbete}
                    disabled={accion === 'E' ? true : false}
                    onChange={cambioEstandar}
                     className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.marbete ? 'border-red-500' : ''}`}
                    
                    required
                />
                {errors.marbete && <p className="text-red-500 text-xs italic">{errors.marbete}</p>}
            </div>
             <div className="mb-4">
                <label className=" text-gray-700 mb-2">Garantia</label>
                <input
                    type="text"
                    id="garantia"
                    name="garantia"
                    value={formData.garantia}
                    onChange={cambioEstandar}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.garantia ? 'border-red-500' : ''}`}
                    
                    required
                />
                {errors.garantia && <p className="text-red-500 text-xs italic">{errors.garantia}</p>}
            </div>   
              <div className="mb-4">
                <label htmlFor="fecha" className=" text-gray-700 mb-2">
                    Fecha de Recepción:
                </label>
                <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={cambioEstandar}
                    disabled = {disable}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                />
            </div>        
            {camposExtrasRender.map(campo => (
            <div key={campo.cod_especificacion} className='mb-4'>
                <label  className=" text-gray-700 mb-2">{campo.nombre}</label>
                <EspecificacionesSelect
                    cod_especificacion={campo.cod_especificacion}
                    nombre={campo.nombre}
                    cod_equipo={formData.cod_equipo}
                    onChange={(valor)=>{
                        setFormData((prev)=>({
                            ...prev,
                            [campo.nombre]:{
                                 ...prev[campo.nombre], // Mantenemos el cod_especificacion original
                                valor: valor // Actualizamos solo la propiedad 'valor'
           
                            } 
                        }))
                        setErrors(prevErrors => ({ ...prevErrors, [campo.nombre]: '' }));
                    }

                    }
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors[campo.nombre] ? 'border-red-500' : ''}`}
                    
                />
                 {errors[campo.nombre] && <p className="text-red-500 text-xs italic">{errors[campo.nombre]}</p>}
            </div>
            ))}
            
        </div>
    );
});

AddEquipoForm.displayName = 'AddEquipoForm'; // Para debugging con React DevTools

export default AddEquipoForm;