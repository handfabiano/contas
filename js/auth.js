// Autenticação (Supabase Auth) — protege o app conforme a policy RLS
// (acesso restrito à role "authenticated"). Não há cadastro público aqui
// de propósito: crie o usuário pelo painel do Supabase (Authentication > Users).

document.addEventListener('DOMContentLoaded', async function() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    atualizarAuthUI(session);

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        atualizarAuthUI(session);
    });

    document.getElementById('formLogin').addEventListener('submit', fazerLogin);
});

function atualizarAuthUI(session) {
    const authGate = document.getElementById('authGate');
    const appContainer = document.getElementById('appContainer');

    if (session) {
        authGate.classList.add('hidden');
        appContainer.classList.remove('hidden');
        iniciarApp();
    } else {
        authGate.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

async function fazerLogin(e) {
    e.preventDefault();

    const btn = document.getElementById('btnLogin');
    const alerta = document.getElementById('authAlert');
    alerta.innerHTML = '';
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    const email = document.getElementById('authEmail').value.trim();
    const senha = document.getElementById('authPassword').value;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });

    if (error) {
        alerta.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }

    btn.disabled = false;
    btn.textContent = 'Entrar';
}

async function sair() {
    await supabaseClient.auth.signOut();
}
