document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Obtener los valores de los campos del formulario
      const name = document.getElementById('name').value;
      const password = document.getElementById('password').value;

      try {
          // Hacer mi solicitud al backend
          const response = await fetch('/auth/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name, password }),
          });

          // Manejar la respuesta del backend
          if (!response.ok) {
              const errorData = await response.json();
              alert(`Error: ${errorData.message}`);
              return;
          }

          const data = await response.json();
          alert(data.message);

          // Redirigir si el login es exitoso
          window.location.href = '/add';
      } catch (error) {
          console.error('Error al comunicarse con el servidor:', error);
          alert('Ocurrió un error inesperado. Intenta de nuevo.');
      }
  });
});
