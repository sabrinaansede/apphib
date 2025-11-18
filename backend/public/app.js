(function() {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        root.setAttribute('data-theme', 'dark');
    }
    btn && btn.addEventListener('click', () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        if (isDark) {
            root.removeAttribute('data-theme');
            localStorage.removeItem('theme');
        } else {
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
})();

// Docs interactive examples
document.addEventListener('DOMContentLoaded', () => {
    const mapping = {
        'GET /api/usuarios': {
            desc: 'Listar usuarios',
            req: 'GET /api/usuarios',
            res: '200 OK\n{ "data": [ { "_id": "...", "nombre": "Ana" } ] }'
        },
        'POST /api/usuarios': {
            desc: 'Crear usuario',
            req: 'POST /api/usuarios\nContent-Type: application/json\n{ "nombre": "Ana", "email": "ana@mail.com", "password": "123" }',
            res: '201 Created\n{ "mensaje": "Usuario creado", "data": { "_id": "...", "nombre": "Ana" } }'
        },
        'GET /api/lugares': {
            desc: 'Listar lugares',
            req: 'GET /api/lugares',
            res: '200 OK\n{ "data": [ { "_id": "...", "nombre": "Parque Central" } ] }'
        },
        'GET /api/lugares/:id': {
            desc: 'Obtener lugar por ID',
            req: 'GET /api/lugares/64f...abc',
            res: '200 OK\n{ "data": { "_id": "64f...abc", "nombre": "Parque Central" } }'
        },
        'PUT /api/lugares/:id': {
            desc: 'Actualizar lugar',
            req: 'PUT /api/lugares/64f...abc\nContent-Type: application/json\n{ "nombre": "Parque Actualizado" }',
            res: '200 OK\n{ "mensaje": "Lugar actualizado", "data": { "_id": "64f...abc", "nombre": "Parque Actualizado" } }'
        },
        'DELETE /api/lugares/:id': {
            desc: 'Eliminar lugar',
            req: 'DELETE /api/lugares/64f...abc',
            res: '200 OK\n{ "mensaje": "Lugar eliminado correctamente" }'
        },
        'GET /api/resenas': {
            desc: 'Listar reseñas',
            req: 'GET /api/resenas',
            res: '200 OK\n[ { "_id": "...", "texto": "Muy cómodo" } ]'
        },
        'GET /api/resenas/lugar/:lugarId': {
            desc: 'Reseñas por lugar',
            req: 'GET /api/resenas/lugar/64f...abc',
            res: '200 OK\n[ { "_id": "...", "texto": "Muy cómodo" } ]'
        },
        'POST /api/resenas': {
            desc: 'Crear reseña',
            req: 'POST /api/resenas\nContent-Type: application/json\n{ "lugarId": "<ID_LUGAR>", "usuarioId": "<ID_USUARIO>", "texto": "Muy cómodo" }',
            res: '201 Created\n{ "mensaje": "Reseña creada", "data": { "_id": "...", "texto": "Muy cómodo" } }'
        }
    };

    const items = document.querySelectorAll('.doc-item');
    const descEl = document.getElementById('docs-desc');
    const reqEl = document.getElementById('docs-req');
    const resEl = document.getElementById('docs-res');

    items.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-endpoint');
            const info = mapping[key];
            if (!info) return;
            items.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            descEl.textContent = info.desc;
            reqEl.textContent = info.req;
            resEl.textContent = info.res;
        });
    });
});


