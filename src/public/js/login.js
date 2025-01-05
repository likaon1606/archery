document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.message}`);
        return;
      }

      const data = await response.json();
      alert(data.message);

      // Almacenar el token
      localStorage.setItem('token', data.token);

      // Verificar acceso a una ruta protegida
      const protectedResponse = await fetch('/list', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (protectedResponse.ok) {
        const protectedData = await protectedResponse.json();
        alert(`Bienvenido: ${protectedData.user.name}`);
        window.location.href = '/list';
      } else {
        const error = await protectedResponse.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al intentar iniciar sesión.');
    }
  });
});
