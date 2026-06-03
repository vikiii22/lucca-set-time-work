// Horarios fijos: 08:00-13:00 y 14:00-17:20
const horarios = ['08:00', '13:00', '14:00', '17:20'];

// Función para buscar inputs de tiempo con múltiples estrategias
function buscarInputsTiempo() {
    // Intentamos varios selectores en orden de preferencia
    const selectores = [
        '.timePicker-fieldset-group-textfield-input:not([aria-hidden])',
        'input[type="time"]',
        'input[class*="timePicker"]:not([aria-hidden])',
        'input[class*="time"]:not([aria-hidden])',
        'input[placeholder*=":"]',
        'input[aria-label*="hour"], input[aria-label*="minute"]',
        'input[class*="Time"]:not([aria-hidden])',
        // Selector genérico para inputs numéricos en contextos de tiempo
        '.timePicker input[type="text"]:not([aria-hidden])'
    ];
    
    for (const selector of selectores) {
        const inputs = document.querySelectorAll(selector);
        if (inputs.length > 0) {
            console.log(`✅ Lucca Auto-Fichaje: Encontrados ${inputs.length} inputs con selector: ${selector}`);
            return inputs;
        }
    }
    
    console.warn('⚠️ Lucca Auto-Fichaje: No se encontraron inputs de tiempo con los selectores conocidos');
    return [];
}

function inyectarBoton() {
    if (document.getElementById('btn-auto-lucca')) return;

    const btn = document.createElement('button');
    btn.id = 'btn-auto-lucca';
    btn.innerText = '🚀 Auto-Fichar';
    btn.style = `
        position: fixed; bottom: 20px; right: 20px; z-index: 9999;
        padding: 12px 20px; background: #ff9361; color: white;
        border: none; border-radius: 50px; cursor: pointer;
        font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    btn.onclick = () => {
        // Buscamos los inputs con múltiples estrategias
        const timeInputs = buscarInputsTiempo();
        let rellenados = 0;

        if (timeInputs.length === 0) {
            btn.innerText = '❌ No encontré inputs';
            console.error('🔍 Abre DevTools para ver qué inputs hay disponibles');
            setTimeout(() => btn.innerText = '🚀 Auto-Fichar', 3000);
            return;
        }

        timeInputs.forEach((input, index) => {
            // Si el input es de tipo "time", usamos el formato HH:MM completo
            if (input.type === 'time') {
                const indiceHorario = index % 4;
                input.value = horarios[indiceHorario];
            } else {
                // Lógica original para inputs separados de hora/minutos
                const esHora = index % 2 === 0;
                const indiceHorario = Math.floor(index / 2) % 4;
                const tiempo = horarios[indiceHorario];
                const [hora, minutos] = tiempo.split(':');
                input.value = esHora ? hora : minutos;
            }
            
            // Disparamos eventos para que el framework actualice
            ['input', 'change', 'blur', 'keyup'].forEach(evt => {
                input.dispatchEvent(new Event(evt, { bubbles: true, cancelable: true }));
            });
            
            input.dispatchEvent(new InputEvent('input', { 
                bubbles: true, 
                cancelable: true,
                data: input.value 
            }));
            
            rellenados++;
        });

        btn.innerText = rellenados > 0 ? `✅ ${rellenados} campos` : '❌ No encontré inputs';
        setTimeout(() => btn.innerText = '🚀 Auto-Fichar', 2000);
    };

    document.body.appendChild(btn);
}

// Intentar inyectar el botón cada vez que cambie algo en la pantalla
const observer = new MutationObserver(inyectarBoton);
observer.observe(document.body, { childList: true, subtree: true });
inyectarBoton();