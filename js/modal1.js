<script type="module">
  const supabase = window.supabase;

  const projectsContainer = document.getElementById('projects-container');
  const addProjectButton = document.getElementById('add-project-button');
  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('edit-form');

  let currentEditingProject = null;

  // Генерация уникального project_id
  const generateProjectID = () => 'proj_' + Math.random().toString(36).substr(2, 9);

  // Создание HTML-контейнера проекта
  function createProjectContainer(project) {
    if (!project) {
      console.error('createProjectContainer вызвана с null или undefined проектом');
      return null;
    }

    if (!project.project_id) {
      console.error('Проект не имеет project_id:', project);
      return null;
    }

    const container = document.createElement('div');
    container.classList.add('modal1-container');
    container.dataset.id = project.project_id;

    // Сохраняем все необходимые данные в data-атрибуты для легкого доступа
    container.dataset.projectName = project.project_name || '';
    container.dataset.status = project.status || '';
    container.dataset.contractAmount = project.contract_amount || 0;
    container.dataset.contractCosts = project.contract_costs || 0;
    container.dataset.contractProfit = project.contract_profit || 0;
    container.dataset.profitPercentage = project.profit_percentage || 0;
    container.dataset.companySeller = project.company_seller || '';
    container.dataset.tinSeller = project.tin_seller || '';
    container.dataset.buyerCompany = project.buyer_company || '';
    container.dataset.tinBuyer = project.tin_buyer || '';

    container.innerHTML = `
      <span class="modal1-icon" style="left: 1vw;" data-action="edit" data-id="${project.project_id}">
        <i class="material-symbols-outlined">edit</i>
      </span>

      <!-- Группы ввода данных -->
      <div class="modal1-input-group left">
        <input type="text" class="modal1-input" id="project-id-${project.project_id}" value="${project.project_id}" placeholder=" " data-field="project_id" readonly />
        <label for="project-id-${project.project_id}">Project ID</label>
      </div>

      <div class="modal1-input-group right">
        <input type="text" class="modal1-input" id="project-name-${project.project_id}" value="${project.project_name}" placeholder=" " data-field="project_name" readonly />
        <label for="project-name-${project.project_id}">Project Name</label>
      </div>

      <div class="modal1-input-group right">
        <input type="text" class="modal1-input" id="status-${project.project_id}" value="${project.status || ''}" placeholder=" " data-field="status" readonly />
        <label for="status-${project.project_id}">Status</label>
      </div>

      <div class="modal1-input-group left">
        <input type="number" step="0.01" class="modal1-input" id="contract-amount-${project.project_id}" value="${project.contract_amount || ''}" placeholder=" " data-field="contract_amount" readonly />
        <label for="contract-amount-${project.project_id}">Contract Amount</label>
      </div>

      <div class="modal1-input-group right">
        <input type="number" step="0.01" class="modal1-input" id="contract-costs-${project.project_id}" value="${project.contract_costs || ''}" placeholder=" " data-field="contract_costs" readonly />
        <label for="contract-costs-${project.project_id}">Contract Costs</label>
      </div>

      <div class="modal1-input-group right">
        <input type="number" step="0.01" class="modal1-input" id="contract-profit-${project.project_id}" value="${project.contract_profit || ''}" placeholder=" " data-field="contract_profit" readonly />
        <label for="contract-profit-${project.project_id}">Contract Profit</label>
      </div>

      <div class="modal1-input-group right">
        <input type="number" step="0.01" class="modal1-input" id="profit-percentage-${project.project_id}" value="${project.profit_percentage || ''}" placeholder=" " data-field="profit_percentage" readonly />
        <label for="profit-percentage-${project.project_id}">Profit %</label>
      </div>

      <div class="modal1-input-group left">
        <input type="text" class="modal1-input" id="company-seller-${project.project_id}" value="${project.company_seller || ''}" placeholder=" " data-field="company_seller" readonly />
        <label for="company-seller-${project.project_id}">Company Seller</label>
      </div>

      <div class="modal1-input-group right">
        <input type="text" class="modal1-input" id="tin-seller-${project.project_id}" value="${project.tin_seller || ''}" placeholder=" " data-field="tin_seller" readonly />
        <label for="tin-seller-${project.project_id}">TIN Seller</label>
      </div>

      <div class="modal1-input-group left">
        <input type="text" class="modal1-input" id="buyer-company-${project.project_id}" value="${project.buyer_company || ''}" placeholder=" " data-field="buyer_company" readonly />
        <label for="buyer-company-${project.project_id}">Buyer Company</label>
      </div>

      <div class="modal1-input-group right">
        <input type="text" class="modal1-input" id="tin-buyer-${project.project_id}" value="${project.tin_buyer || ''}" placeholder=" " data-field="tin_buyer" readonly />
        <label for="tin-buyer-${project.project_id}">TIN Buyer</label>
      </div>

      <span class="modal1-icon" style="margin-left: 6vw; right: 1vw;" data-action="delete" data-id="${project.project_id}">
        <i class="material-symbols-outlined">delete</i>
      </span>
    `;

    return container;
  }

  // Загрузка всех проектов
  async function loadProjects() {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) {
      console.error('Ошибка загрузки проектов:', error);
      return;
    }

    projectsContainer.innerHTML = ''; // Очищаем контейнер

    const fragment = document.createDocumentFragment();
    data.forEach((project) => {
      const projectElement = createProjectContainer(project);
      if (projectElement) {
        fragment.appendChild(projectElement);
      }
    });
    projectsContainer.appendChild(fragment);
  }

  // Добавление нового проекта
  async function addNewProject() {
    const newProject = {
      project_id: generateProjectID(),
      project_name: 'Новый проект',
      status: 'Новый',
      contract_amount: 0.00,
      contract_costs: 0.00,
      contract_profit: 0.00,
      profit_percentage: 0.00,
      company_seller: '',
      tin_seller: '',
      buyer_company: '',
      tin_buyer: '',
    };

    // Добавляем .select('*') для возврата всех полей вставленной записи
    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select('*') // Добавлено для возврата данных
      .single();    // Остаётся

    if (error) {
      console.error('Ошибка добавления проекта:', error);
      return;
    }

    if (!data) {
      console.error('Нет данных после вставки нового проекта');
      return;
    }

    // Удаляем ручное добавление проекта в DOM
    // Ручное добавление не требуется, Realtime обработает это событие
  }

  // Удаление проекта
  async function deleteProject(projectId) {
    const { error } = await supabase.from('projects').delete().eq('project_id', projectId);
    if (error) {
      console.error('Ошибка удаления проекта:', error);
      return;
    }

    const projectElement = projectsContainer.querySelector(`[data-id="${projectId}"]`);
    if (projectElement && projectsContainer.contains(projectElement)) {
      projectsContainer.removeChild(projectElement);
    } else {
      console.error(`Элемент проекта с project_id ${projectId} не найден в projectsContainer.`);
    }
  }

  // Открытие модального окна редактирования
  function openEditModal(projectId) {
    const projectElement = projectsContainer.querySelector(`[data-id="${projectId}"]`);
    if (!projectElement) {
      console.error(`Проект с project_id ${projectId} не найден.`);
      return;
    }

    // Получаем данные из data-атрибутов
    const project = {
      project_id: projectId,
      project_name: projectElement.dataset.projectName,
      status: projectElement.dataset.status,
      contract_amount: projectElement.dataset.contractAmount,
      contract_costs: projectElement.dataset.contractCosts,
      contract_profit: projectElement.dataset.contractProfit,
      profit_percentage: projectElement.dataset.profitPercentage,
      company_seller: projectElement.dataset.companySeller,
      tin_seller: projectElement.dataset.tinSeller,
      buyer_company: projectElement.dataset.buyerCompany,
      tin_buyer: projectElement.dataset.tinBuyer,
    };

    currentEditingProject = project;

    // Заполняем форму
    editForm['edit-project-name'].value = project.project_name;
    editForm['edit-status'].value = project.status;
    editForm['edit-contract-amount'].value = project.contract_amount;
    editForm['edit-contract-cost'].value = project.contract_costs;
    editForm['edit-contract-profit'].value = project.contract_profit;
    editForm['edit-profit-percentage'].value = project.profit_percentage;
    editForm['edit-company-seller'].value = project.company_seller;
    editForm['edit-tin-seller'].value = project.tin_seller;
    editForm['edit-buyer-company'].value = project.buyer_company;
    editForm['edit-tin-buyer'].value = project.tin_buyer;

    // Показываем модальное окно
    editModal.classList.remove('hidden');
  }

  // Закрытие модального окна редактирования
  function closeEditModal() {
    editModal.classList.add('hidden');
    currentEditingProject = null;
  }

  // Сохранение изменений в проекте
  async function saveProject() {
    if (!currentEditingProject) {
      console.error('Нет текущего редактируемого проекта.');
      return;
    }

    const updatedProject = {
      project_name: editForm['edit-project-name'].value,
      status: editForm['edit-status'].value,
      contract_amount: parseFloat(editForm['edit-contract-amount'].value) || 0.00,
      contract_costs: parseFloat(editForm['edit-contract-cost'].value) || 0.00,
      contract_profit: parseFloat(editForm['edit-contract-profit'].value) || 0.00,
      profit_percentage: parseFloat(editForm['edit-profit-percentage'].value) || 0.00,
      company_seller: editForm['edit-company-seller'].value,
      tin_seller: editForm['edit-tin-seller'].value,
      buyer_company: editForm['edit-buyer-company'].value,
      tin_buyer: editForm['edit-tin-buyer'].value,
    };

    const { data, error } = await supabase
      .from('projects')
      .update(updatedProject)
      .eq('project_id', currentEditingProject.project_id)
      .select('*') // Добавлено для возврата обновлённой записи
      .single();

    if (error) {
      console.error('Ошибка сохранения проекта:', error);
      return;
    }

    // Обновляем все поля проекта в DOM
    const projectElement = projectsContainer.querySelector(`[data-id="${currentEditingProject.project_id}"]`);
    if (projectElement) {
      // Обновляем data-атрибуты
      projectElement.dataset.projectName = data.project_name || '';
      projectElement.dataset.status = data.status || '';
      projectElement.dataset.contractAmount = data.contract_amount || 0;
      projectElement.dataset.contractCosts = data.contract_costs || 0;
      projectElement.dataset.contractProfit = data.contract_profit || 0;
      projectElement.dataset.profitPercentage = data.profit_percentage || 0;
      projectElement.dataset.companySeller = data.company_seller || '';
      projectElement.dataset.tinSeller = data.tin_seller || '';
      projectElement.dataset.buyerCompany = data.buyer_company || '';
      projectElement.dataset.tinBuyer = data.tin_buyer || '';

      // Обновляем значения всех полей ввода
      const fields = ['project_id', 'project_name', 'status', 'contract_amount', 'contract_costs', 'contract_profit', 'profit_percentage', 'company_seller', 'tin_seller', 'buyer_company', 'tin_buyer'];
      fields.forEach(field => {
        const input = projectElement.querySelector(`[data-field="${field}"]`);
        if (input) {
          input.value = data[field] !== undefined ? data[field] : '';
        }
      });
    }

    // Закрываем модальное окно
    closeEditModal();
  }

  // Подписка на изменения в таблице projects (реальное время)
  function setupRealtime() {
    const channel = supabase
      .channel('realtime_projects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          const projectId = payload.new?.project_id || payload.old?.project_id;
          if (!projectId) return;

          if (payload.eventType === 'INSERT' && payload.new) {
            // Проверяем, существует ли уже проект в DOM
            if (!projectsContainer.querySelector(`[data-id="${projectId}"]`)) {
              const projectElement = createProjectContainer(payload.new);
              if (projectElement) {
                projectsContainer.appendChild(projectElement);
              }
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const projectElement = projectsContainer.querySelector(`[data-id="${projectId}"]`);
            if (projectElement) {
              const updatedProject = payload.new;

              // Обновляем data-атрибуты
              projectElement.dataset.projectName = updatedProject.project_name || '';
              projectElement.dataset.status = updatedProject.status || '';
              projectElement.dataset.contractAmount = updatedProject.contract_amount || 0;
              projectElement.dataset.contractCosts = updatedProject.contract_costs || 0;
              projectElement.dataset.contractProfit = updatedProject.contract_profit || 0;
              projectElement.dataset.profitPercentage = updatedProject.profit_percentage || 0;
              projectElement.dataset.companySeller = updatedProject.company_seller || '';
              projectElement.dataset.tinSeller = updatedProject.tin_seller || '';
              projectElement.dataset.buyerCompany = updatedProject.buyer_company || '';
              projectElement.dataset.tinBuyer = updatedProject.tin_buyer || '';

              // Обновляем значения всех полей ввода
              const fields = ['project_id', 'project_name', 'status', 'contract_amount', 'contract_costs', 'contract_profit', 'profit_percentage', 'company_seller', 'tin_seller', 'buyer_company', 'tin_buyer'];
              fields.forEach(field => {
                const input = projectElement.querySelector(`[data-field="${field}"]`);
                if (input) {
                  input.value = updatedProject[field] !== undefined ? updatedProject[field] : '';
                }
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const projectElement = projectsContainer.querySelector(`[data-id="${projectId}"]`);
            if (projectElement) {
              projectsContainer.removeChild(projectElement);
            }
          }
        }
      )
      .subscribe();

    channel.on('subscription_error', (status) => {
      console.error('Ошибка подписки на канал:', status);
    });
  }

  // Обработка кликов на кнопке "Добавить проект"
  if (addProjectButton) {
    addProjectButton.addEventListener('click', addNewProject);
  }

  // Обработка кликов на иконках в контейнерах
  projectsContainer.addEventListener('click', (event) => {
    const icon = event.target.closest('.modal1-icon');
    if (!icon) return;

    const action = icon.dataset.action;
    const projectId = icon.dataset.id;

    if (action === 'delete') {
      deleteProject(projectId);
    } else if (action === 'edit') {
      openEditModal(projectId);
    }
  });

  // Добавляем обработчики событий для кнопок закрытия и сохранения
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  document.querySelector('.close-edit-modal').addEventListener('click', closeEditModal);
  editForm.querySelector('.save-button').addEventListener('click', saveProject);

  // Запуск
  loadProjects();
  setupRealtime();

  // Экспорт функций в глобальную область видимости (если необходимо)
  window.saveProject = saveProject;
  window.closeModal = closeModal;
  window.closeEditModal = closeEditModal;
</script>
