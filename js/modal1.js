// js/modal1.js

//функция инициализации modal1
export function initModal1() {
  // //подключаемся к глобальному supabase
  const supabase = window.supabase;

  // //находим нужные элементы (уже вставленные в DOM)
  const projectsContainer = document.getElementById('projects-container');
  const addProjectButton = document.getElementById('add-project-button');
  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('edit-form');
  const closeModalBtn = document.querySelector('.close-modal');
  const closeEditModalBtn = document.querySelector('.close-edit-modal');
  const saveButton = editForm.querySelector('.save-button');

  // //канал для Realtime, чтобы можно было отписаться
  let channel = null;
  let currentEditingProject = null;

  //функция для генерации ID
  function generateProjectID() {
    return 'proj_' + Math.random().toString(36).substr(2, 9);
  }

  //функция создания DOM-элемента для проекта
  function createProjectContainer(project) {
    if (!project || !project.project_id) {
      console.error('Неверные данные проекта:', project);
      return null;
    }

    const container = document.createElement('div');
    container.classList.add('modal1-container');
    container.dataset.id = project.project_id;

    // //записываем данные в data-атрибуты для удобства
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

    // //формируем вёрстку
    container.innerHTML = `
      <span class="modal1-icon" style="left: 1vw;" data-action="edit" data-id="${project.project_id}">
        <i class="material-symbols-outlined">edit</i>
      </span>

      <div class="modal1-input-group left">
        <input type="text" class="modal1-input" id="project-id-${project.project_id}"
               value="${project.project_id}" placeholder=" " data-field="project_id" readonly />
        <label for="project-id-${project.project_id}">Project ID</label>
      </div>

      <div class="modal1-input-group right">
        <input type="text" class="modal1-input" id="project-name-${project.project_id}"
               value="${project.project_name || ''}" placeholder=" "
               data-field="project_name" readonly />
        <label for="project-name-${project.project_id}">Project Name</label>
      </div>

      <div class="modal1-input-group right">
        <input type="text" class="modal1-input" id="status-${project.project_id}"
               value="${project.status || ''}" placeholder=" "
               data-field="status" readonly />
        <label for="status-${project.project_id}">Status</label>
      </div>

      <div class="modal1-input-group left">
        <input type="number" step="0.01" class="modal1-input" id="contract-amount-${project.project_id}"
               value="${project.contract_amount || ''}" placeholder=" "
               data-field="contract_amount" readonly />
        <label for="contract-amount-${project.project_id}">Contract Amount</label>
      </div>

      <div class="modal1-input-group right">
        <input type="number" step="0.01" class="modal1-input" id="contract-costs-${project.project_id}"
               value="${project.contract_costs || ''}" placeholder=" "
               data-field="contract_costs" readonly />
        <label for="contract-costs-${project.project_id}">Contract Costs</label>
      </div>

      <div class="modal1-input-group right">
        <input type="number" step="0.01" class="modal1-input" id="contract-profit-${project.project_id}"
               value="${project.contract_profit || ''}" placeholder=" "
               data-field="contract_profit" readonly />
        <label for="contract-profit-${project.project_id}">Contract Profit</label>
      </div>

      <div class="modal1-input-group right">
        <input type="number" step="0.01" class="modal1-input" id="profit-percentage-${project.project_id}"
               value="${project.profit_percentage || ''}" placeholder=" "
               data-field="profit_percentage" readonly />
        <label for="profit-percentage-${project.project_id}">Profit %</label>
      </div>

      <div class="modal1-input-group left">
        <input type="text" class="modal1-input" id="company-seller-${project.project_id}"
               value="${project.company_seller || ''}" placeholder=" "
               data-field="company_seller" readonly />
        <label for="company-seller-${project.project_id}">Company Seller</label>
      </div>

      <div class="modal1-input-group right">
        <input type="text" class="modal1-input" id="tin-seller-${project.project_id}"
               value="${project.tin_seller || ''}" placeholder=" "
               data-field="tin_seller" readonly />
        <label for="tin-seller-${project.project_id}">TIN Seller</label>
      </div>

      <div class="modal1-input-group left">
        <input type="text" class="modal1-input" id="buyer-company-${project.project_id}"
               value="${project.buyer_company || ''}" placeholder=" "
               data-field="buyer_company" readonly />
        <label for="buyer-company-${project.project_id}">Buyer Company</label>
      </div>

      <div class="modal1-input-group right">
        <input type="text" class="modal1-input" id="tin-buyer-${project.project_id}"
               value="${project.tin_buyer || ''}" placeholder=" "
               data-field="tin_buyer" readonly />
        <label for="tin-buyer-${project.project_id}">TIN Buyer</label>
      </div>

      <span class="modal1-icon" style="margin-left: 6vw; right: 1vw;"
            data-action="delete" data-id="${project.project_id}">
        <i class="material-symbols-outlined">delete</i>
      </span>
    `;

    return container;
  }

  //функция загрузки всех проектов
  async function loadProjects() {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) {
      console.error('Ошибка загрузки проектов:', error);
      return;
    }
    projectsContainer.innerHTML = ''; //очищаем

    const fragment = document.createDocumentFragment();
    data.forEach(project => {
      const projectEl = createProjectContainer(project);
      if (projectEl) fragment.appendChild(projectEl);
    });
    projectsContainer.appendChild(fragment);
  }

  //функция добавления нового проекта
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
    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select('*')
      .single();
    if (error) {
      console.error('Ошибка добавления проекта:', error);
      return;
    }
    // При удачной вставке Realtime сама добавит проект в DOM (через handleRealtime)
  }

  //функция удаления проекта
  async function deleteProject(projectId) {
    const { error } = await supabase.from('projects').delete().eq('project_id', projectId);
    if (error) {
      console.error('Ошибка удаления проекта:', error);
      return;
    }
  }

  //открытие окна редактирования
  function openEditModal(projectId) {
    const projectElement = projectsContainer.querySelector(`[data-id="${projectId}"]`);
    if (!projectElement) {
      console.error('Проект не найден в DOM:', projectId);
      return;
    }
    currentEditingProject = {
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

    // Заполняем форму
    editForm['edit-project-name'].value = currentEditingProject.project_name;
    editForm['edit-status'].value = currentEditingProject.status;
    editForm['edit-contract-amount'].value = currentEditingProject.contract_amount;
    editForm['edit-contract-cost'].value = currentEditingProject.contract_costs;
    editForm['edit-contract-profit'].value = currentEditingProject.contract_profit;
    editForm['edit-profit-percentage'].value = currentEditingProject.profit_percentage;
    editForm['edit-company-seller'].value = currentEditingProject.company_seller;
    editForm['edit-tin-seller'].value = currentEditingProject.tin_seller;
    editForm['edit-buyer-company'].value = currentEditingProject.buyer_company;
    editForm['edit-tin-buyer'].value = currentEditingProject.tin_buyer;

    // Показываем окно
    editModal.classList.remove('hidden');
  }

  //закрытие окна редактирования
  function closeEditModal() {
    editModal.classList.add('hidden');
    currentEditingProject = null;
  }

  //сохранение изменений
  async function saveProject() {
    if (!currentEditingProject) return;

    const updatedProject = {
      project_name: editForm['edit-project-name'].value,
      status: editForm['edit-status'].value,
      contract_amount: parseFloat(editForm['edit-contract-amount'].value) || 0,
      contract_costs: parseFloat(editForm['edit-contract-cost'].value) || 0,
      contract_profit: parseFloat(editForm['edit-contract-profit'].value) || 0,
      profit_percentage: parseFloat(editForm['edit-profit-percentage'].value) || 0,
      company_seller: editForm['edit-company-seller'].value,
      tin_seller: editForm['edit-tin-seller'].value,
      buyer_company: editForm['edit-buyer-company'].value,
      tin_buyer: editForm['edit-tin-buyer'].value,
    };
    const { data, error } = await supabase
      .from('projects')
      .update(updatedProject)
      .eq('project_id', currentEditingProject.project_id)
      .select('*')
      .single();
    if (error) {
      console.error('Ошибка сохранения проекта:', error);
      return;
    }
    closeEditModal();
  }

  //функция обработки Realtime-событий
  function handleRealtime(payload) {
     console.log('=== Realtime event! ===', payload);
alert('Realtime called!');
    
    const projectId = payload.new?.project_id || payload.old?.project_id;
    if (!projectId) return;

    if (payload.eventType === 'INSERT' && payload.new) {
      // Новый проект
      if (!projectsContainer.querySelector(`[data-id="${projectId}"]`)) {
        const el = createProjectContainer(payload.new);
        if (el) projectsContainer.appendChild(el);
      }
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      // Обновление
      const el = projectsContainer.querySelector(`[data-id="${projectId}"]`);
      if (el) {
        const updatedProject = payload.new;
        // Обновляем data-атрибуты
        el.dataset.projectName = updatedProject.project_name || '';
        el.dataset.status = updatedProject.status || '';
        el.dataset.contractAmount = updatedProject.contract_amount || 0;
        el.dataset.contractCosts = updatedProject.contract_costs || 0;
        el.dataset.contractProfit = updatedProject.contract_profit || 0;
        el.dataset.profitPercentage = updatedProject.profit_percentage || 0;
        el.dataset.companySeller = updatedProject.company_seller || '';
        el.dataset.tinSeller = updatedProject.tin_seller || '';
        el.dataset.buyerCompany = updatedProject.buyer_company || '';
        el.dataset.tinBuyer = updatedProject.tin_buyer || '';
        // Обновляем поля
        const fields = [
          'project_id','project_name','status','contract_amount','contract_costs',
          'contract_profit','profit_percentage','company_seller','tin_seller',
          'buyer_company','tin_buyer'
        ];
        fields.forEach(field => {
          const input = el.querySelector(`[data-field="${field}"]`);
          if (input) {
            input.value = updatedProject[field] || '';
          }
        });
      }
    } else if (payload.eventType === 'DELETE') {
      // Удаление
      const el = projectsContainer.querySelector(`[data-id="${projectId}"]`);
      if (el) {
        projectsContainer.removeChild(el);
      }
    }
  }

  //функция подписки на Realtime
  function setupRealtime() {
    channel = supabase
      .channel('realtime_projects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        payload => handleRealtime(payload)
      )
      .subscribe();
  }

  //функция отписки от Realtime
  function unsubscribeRealtime() {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  }

  //начинаем работу
  loadProjects();
  setupRealtime();

  // //вешаем обработчики
  if (addProjectButton) {
    addProjectButton.addEventListener('click', addNewProject);
  }

  if (projectsContainer) {
    projectsContainer.addEventListener('click', e => {
      const icon = e.target.closest('.modal1-icon');
      if (!icon) return;
      const action = icon.dataset.action;
      const projectId = icon.dataset.id;
      if (!projectId) return;

      if (action === 'delete') deleteProject(projectId);
      else if (action === 'edit') openEditModal(projectId);
    });
  }

  if (closeModalBtn) {
    // //закрытие самой модалки (общий closeModal, если нужно)
    closeModalBtn.addEventListener('click', () => {
      // Если у вас уже есть глобальная функция closeModal из index.html, вызываем её
      // window.closeModal();
      // Или пишем свою логику закрытия
      window.closeModal(); // предполагаем, что в index.html есть такая функция
      // плюс при желании можно отписаться от Realtime здесь:
      unsubscribeRealtime();
    });
  }

  if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener('click', closeEditModal);
  }

  if (saveButton) {
    saveButton.addEventListener('click', saveProject);
  }

  // //возвращаем что-то при необходимости
  return {
    unsubscribeRealtime,
  };
}
