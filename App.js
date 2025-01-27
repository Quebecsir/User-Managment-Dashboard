document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const userTableBody = document.getElementById('userTableBody');
  const userModal = document.getElementById('userModal');
  const userForm = document.getElementById('userForm');
  const addUserBtn = document.getElementById('addUserBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const closeBtn = document.querySelector('.close-btn');
  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitBtn');
  const errorMessage = document.getElementById('errorMessage');

  // State
  let users = [];
  let currentUser = null;

  // Initialize
  fetchUsers();

  // Event Listeners
  addUserBtn.addEventListener('click', () => openModal());
  cancelBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  userForm.addEventListener('submit', handleSubmit);

  // API Functions
  async function fetchUsers() {
      try {
          showLoading(true);
          const response = await fetch('https://jsonplaceholder.typicode.com/users');
          if (!response.ok) throw new Error('Failed to fetch users');
          const data = await response.json();
          
          users = data.map(user => ({
              id: user.id,
              firstName: user.name.split(' ')[0],
              lastName: user.name.split(' ')[1] || '',
              email: user.email,
              department: user.company?.name || 'Not Assigned'
          }));
          
          renderUsers();
          showError(null);
      } catch (err) {
          showError('Failed to load users. Please try again later.');
          console.error(err);
      } finally {
          showLoading(false);
      }
  }

  async function saveUser(userData) {
      try {
          showLoading(true);
          const url = 'https://jsonplaceholder.typicode.com/users';
          const method = currentUser ? 'PUT' : 'POST';
          const id = currentUser?.id;
          
          const response = await fetch(
              currentUser ? `${url}/${id}` : url,
              {
                  method,
                  body: JSON.stringify({
                      name: `${userData.firstName} ${userData.lastName}`,
                      email: userData.email,
                      company: { name: userData.department }
                  }),
                  headers: {
                      'Content-type': 'application/json'
                  }
              }
          );

          if (!response.ok) throw new Error('Failed to save user');

          if (currentUser) {
              users = users.map(user => 
                  user.id === currentUser.id 
                      ? { ...userData, id: currentUser.id }
                      : user
              );
          } else {
              const data = await response.json();
              users.push({ ...userData, id: data.id });
          }

          renderUsers();
          closeModal();
          showError(null);
      } catch (err) {
          showError('Failed to save user. Please try again.');
          console.error(err);
      } finally {
          showLoading(false);
      }
  }

  async function deleteUser(id) {
      try {
          showLoading(true);
          const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
              method: 'DELETE'
          });

          if (!response.ok) throw new Error('Failed to delete user');

          users = users.filter(user => user.id !== id);
          renderUsers();
          showError(null);
      } catch (err) {
          showError('Failed to delete user. Please try again.');
          console.error(err);
      } finally {
          showLoading(false);
      }
  }

  // UI Functions
  function renderUsers() {
      if (users.length === 0) {
          userTableBody.innerHTML = `
              <tr>
                  <td colspan="6" style="text-align: center; padding: 1rem;">
                      No users found
                  </td>
              </tr>
          `;
          return;
      }

      userTableBody.innerHTML = users.map(user => `
          <tr>
              <td>${user.id}</td>
              <td>${user.firstName}</td>
              <td>${user.lastName}</td>
              <td>${user.email}</td>
              <td>${user.department}</td>
              <td>
                  <div class="actions">
                      <button 
                          onclick="handleEdit(${user.id})" 
                          class="action-btn edit-btn"
                          title="Edit user"
                      >
                          ✏️
                      </button>
                      <button 
                          onclick="handleDelete(${user.id})" 
                          class="action-btn delete-btn"
                          title="Delete user"
                      >
                          🗑️
                      </button>
                  </div>
              </td>
          </tr>
      `).join('');
  }

  function showLoading(show) {
      if (show) {
          userTableBody.innerHTML = `
              <tr>
                  <td colspan="6" style="text-align: center; padding: 1rem;">
                      <div class="loading-spinner"></div>
                  </td>
              </tr>
          `;
      }
  }

  function showError(message) {
      errorMessage.textContent = message || '';
      errorMessage.classList.toggle('hidden', !message);
  }

  function openModal(user = null) {
      currentUser = user;
      modalTitle.textContent = user ? 'Edit User' : 'Add New User';
      submitBtn.textContent = user ? 'Save Changes' : 'Add User';
      
      if (user) {
          userForm.firstName.value = user.firstName;
          userForm.lastName.value = user.lastName;
          userForm.email.value = user.email;
          userForm.department.value = user.department;
      } else {
          userForm.reset();
      }
      
      userModal.classList.remove('hidden');
  }

  function closeModal() {
      userModal.classList.add('hidden');
      currentUser = null;
      userForm.reset();
  }

  // Event Handlers
  function handleSubmit(e) {
      e.preventDefault();
      const formData = {
          firstName: userForm.firstName.value,
          lastName: userForm.lastName.value,
          email: userForm.email.value,
          department: userForm.department.value
      };
      saveUser(formData);
  }

  // Expose these functions to the global scope for onclick handlers
  window.handleEdit = function(id) {
      const user = users.find(u => u.id === id);
      if (user) openModal(user);
  };

  window.handleDelete = function(id) {
      if (confirm('Are you sure you want to delete this user?')) {
          deleteUser(id);
      }
  };
});