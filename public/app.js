// public/app.js - Botanika Ön Yüz Mantığı

const API_URL = 'http://localhost:3000/api';
let currentToken = localStorage.getItem('botanika_token') || null;
let currentUsername = localStorage.getItem('botanika_username') || null;
let allPlants = []; 
let currentFilter = 'Tümü';

const authPanel = document.getElementById('authPanel');
const mainPanel = document.getElementById('mainPanel');
const welcomeText = document.getElementById('welcomeText');
const usernameSpan = document.getElementById('usernameSpan');
const logoutBtn = document.getElementById('logoutBtn');
const plantsContainer = document.getElementById('plantsContainer');
const plantCount = document.getElementById('plantCount');
const mainAuthBtn = document.getElementById('mainAuthBtn');
const switchAuthLink = document.getElementById('switchAuthLink');
const authTitle = document.getElementById('authTitle');
const toggleAuthText = document.getElementById('toggleAuthText');

let isLoginMode = true;

// UYGULAMA AÇILDIĞINDA TARAYICIDAN BİLDİRİM İZNİ İSTEYEN FONKSİYON
function checkNotificationPermission() {
    // Tarayıcı bildirim özelliğini destekliyor mu?
    if (!("Notification" in window)) {
        console.log("Bu tarayıcı masaüstü bildirimlerini desteklemiyor.");
        return;
    }

    // Eğer henüz izin istenmediyse (default durumundaysa) izin iste
    if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Bildirim izni verildi! 🎉");
            }
        });
    }
}

// Fonksiyonu hemen çalıştır ki site açılır açılmaz izin kutusu gelsin
checkNotificationPermission();

// --- 🔐 OTURUM GİRİŞ / KAYIT ---
if (switchAuthLink) {
    switchAuthLink.addEventListener('click', function toggleMode(e) {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authTitle.innerText = 'Hesabına Giriş Yap';
            mainAuthBtn.innerText = 'Giriş Yap';
            toggleAuthText.innerHTML = `Hesabın yok mu? <a href="#" id="switchAuthLink" class="text-success fw-bold text-decoration-none">Şimdi Kayıt Ol</a>`;
        } else {
            authTitle.innerText = 'Yeni Hesap Oluştur';
            mainAuthBtn.innerText = 'Kayıt Ol';
            toggleAuthText.innerHTML = `Zaten hesabın var mı? <a href="#" id="switchAuthLink" class="text-success fw-bold text-decoration-none">Giriş Yap</a>`;
        }
        document.getElementById('switchAuthLink').addEventListener('click', toggleMode);
    });
}

mainAuthBtn.addEventListener('click', async () => {
    const kullanici_adi = document.getElementById('authUsername').value.trim();
    const sifre = document.getElementById('authPassword').value.trim();

    if (!kullanici_adi || !sifre) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kullanici_adi, sifre })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Bir hata oluştu!');
            return;
        }

        if (isLoginMode) {
            currentToken = data.token;
            currentUsername = data.kullanici_adi;
            localStorage.setItem('botanika_token', currentToken);
            localStorage.setItem('botanika_username', currentUsername);
            checkAuth();
        } else {
            alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
            isLoginMode = true;
            authTitle.innerText = 'Hesabına Giriş Yap';
            mainAuthBtn.innerText = 'Giriş Yap';
        }
    } catch (err) {
        alert('Sunucuya bağlanılamadı!');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('botanika_token');
    localStorage.removeItem('botanika_username');
    currentToken = null;
    currentUsername = null;
    checkAuth();
});

function checkAuth() {
    if (currentToken) {
        authPanel.setAttribute('style', 'display: none !important;');
        mainPanel.classList.remove('d-none');
        welcomeText.classList.remove('d-none');
        logoutBtn.classList.remove('d-none');
        usernameSpan.innerText = currentUsername;
        fetchPlants(); 
    } else {
        authPanel.setAttribute('style', 'display: flex !important;');
        mainPanel.classList.add('d-none');
        welcomeText.classList.add('d-none');
        logoutBtn.classList.add('d-none');
        plantsContainer.innerHTML = '';
    }
}

// --- 🌿 BİTKİ YÖNETİMİ ---
async function fetchPlants() {
    try {
        const response = await fetch(`${API_URL}/plants`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (response.status === 403 || response.status === 401) {
            logoutBtn.click();
            return;
        }
        allPlants = await response.json();
        renderPlants();
        sendWateringNotification(allPlants);
    } catch (err) {
        console.error('Veri çekme hatası:', err);
    }
}

function renderPlants() {
    plantsContainer.innerHTML = '';

    const totalCount = allPlants.length;
    const acilCount = allPlants.filter(p => p.durum === 'Acil' || p.durum === 'acil').length;
    const saglikliCount = allPlants.filter(p => p.durum === 'Sağlıklı' || p.durum === 'Saglikli' || p.durum === 'sağlıklı').length;

    document.getElementById('dashTotal').innerText = totalCount;
    document.getElementById('dashAcil').innerText = acilCount;
    document.getElementById('dashSaglikli').innerText = saglikliCount;
    
    const filteredPlants = allPlants.filter(plant => {
        if (currentFilter === 'Tümü') return true;
        if (currentFilter === 'Yakin') return plant.durum === 'Yakın';
        return plant.durum === currentFilter;
    });

    plantCount.innerText = filteredPlants.length;

    if (filteredPlants.length === 0) {
        plantsContainer.innerHTML = `<div class="col-12 text-center text-muted my-5"><i class="fa-solid fa-folder-open fa-2x mb-2 text-success"></i><br>Bu kategoride bitki bulunamadı.</div>`;
        return;
    }

    filteredPlants.forEach(plant => {
        let badgeClass = 'badge-saglikli';
        let statusIcon = 'fa-circle-check';
        if (plant.durum === 'Acil') {
            badgeClass = 'badge-acil';
            statusIcon = 'fa-triangle-exclamation';
        } else if (plant.durum === 'Yakın') {
            badgeClass = 'badge-yakin';
            statusIcon = 'fa-clock';
        }

        // 🖼️ Eğer Unsplash'tan resim gelmediyse veya boşsa şık bir varsayılan doğa resmi gösteriyoruz
        const bitkiResmi = plant.resim_url || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500';

        const cardHtml = `
          <div class="col">
                <div class="card h-100 shadow-sm plant-card bg-white overflow-hidden">
                    <img src="${bitkiResmi}" alt="${plant.isim}" class="plant-card-img" style="width: 100%; height: 160px; object-fit: cover;">
                    
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title fw-bold text-success m-0"><i class="fa-solid fa-seedling me-2"></i>${plant.isim}</h5>
                            <span class="badge ${badgeClass} rounded-pill px-3 py-2 small">
                                <i class="fa-solid ${statusIcon} me-1"></i>${plant.durum}
                            </span>
                        </div>
                        <h6 class="text-muted mb-3 small"><i class="fa-solid fa-dna me-1 text-secondary"></i> Tür: ${plant.tur}</h6>
                        <p class="card-text text-secondary small flex-grow-1 mb-3">${plant.aciklama || '<i>Açıklama eklenmemiş.</i>'}</p>
                        
                        <div class="bg-light p-3 rounded-3 mb-2 small text-muted border-0">
                            <div class="mb-2"><i class="fa-solid fa-calendar-day me-2 text-success"></i><b>Son Sulama:</b> ${plant.son_sulama_tarihi}</div>
                            <div class="mb-2"><i class="fa-solid fa-arrows-rotate me-2 text-success"></i><b>Periyot:</b> ${plant.sulama_periyodu} Gün</div>
                            <div><i class="fa-solid fa-hourglass-half me-2 text-success"></i><b>Kalan Gün:</b> <span class="fw-bold">${plant.kalan_gun < 0 ? 'Süresi Geçti' : plant.kalan_gun + ' Gün'}</span></div>
                        </div>

                        <div class="p-2 mb-3 rounded-3 small text-secondary bg-white border border-light-subtle">
                            <div class="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-light">
                                <span><i class="fa-solid fa-mountain text-warning me-2"></i><b>Toprak:</b> ${plant.toprak_bakimi || ''}</span>
                                <button type="button" class="btn btn-sm btn-link text-success p-0 text-decoration-none fw-bold small" onclick="updateCare(${plant.id}, 'toprak')" style="font-size: 11px;">🪵 Güncelle</button>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-light">
                                <span><i class="fa-solid fa-spray-can text-danger me-2"></i><b>İlaçlama:</b> ${plant.ilaclama_notu || ''}</span>
                                <button type="button" class="btn btn-sm btn-link text-success p-0 text-decoration-none fw-bold small" onclick="updateCare(${plant.id}, 'ilac')" style="font-size: 11px;">🧪 İlaçla</button>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <span><i class="fa-solid fa-syringe text-info me-2"></i><b>Aşılama:</b> ${plant.asilama_durumu || ''}</span>
                                <button type="button" class="btn btn-sm btn-link text-success p-0 text-decoration-none fw-bold small" onclick="updateCare(${plant.id}, 'asi')" style="font-size: 11px;">💉 Aşıla</button>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-auto">
                            <button class="btn btn-success btn-sm w-100 fw-bold py-2 rounded-pill shadow-sm" onclick="waterPlant(${plant.id})">
                                <i class="fa-solid fa-droplet me-1"></i> Suladım
                            </button>
                            <button class="btn btn-outline-secondary btn-sm rounded-circle px-3" onclick="showHistory(${plant.id})" title="Sulama Geçmişi">
                                <i class="fa-solid fa-clock-rotate-left"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm rounded-circle px-3" onclick="deletePlant(${plant.id})">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        plantsContainer.innerHTML += cardHtml;
    });
}

document.getElementById('plantForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bodyData = {
        isim: document.getElementById('pIsim').value.trim(),
        tur: document.getElementById('pTur').value.trim(),
        aciklama: document.getElementById('pAciklama').value.trim(),
        sulama_periyodu: parseInt(document.getElementById('pPeriyot').value),
        son_sulama_tarihi: document.getElementById('pSonTarih').value
    };

    try {
        const response = await fetch(`${API_URL}/plants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            document.getElementById('plantForm').reset();
            const modalEl = document.getElementById('addPlantModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
            fetchPlants();
        } else {
            const data = await response.json();
            alert(data.error || 'Hata oluştu.');
        }
    } catch (err) {
        alert('Bağlantı hatası.');
    }
});

async function waterPlant(id) {
    try {
        const response = await fetch(`${API_URL}/plants/${id}/water`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (response.ok) {
            fetchPlants();
        }
    } catch (err) {
        alert('Bağlantı hatası.');
    }
}

async function deletePlant(id) {
    if (!confirm('Bu bitkiyi silmek istediğinize emin misiniz?')) return;

    try {
        const response = await fetch(`${API_URL}/plants/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (response.ok) {
            fetchPlants();
        }
    } catch (err) {
        alert('Bağlantı hatası.');
    }
}

async function showHistory(plantId) {
    const listEl = document.getElementById('historyList');
    listEl.innerHTML = '<li class="text-center text-muted py-2"><i class="fa-solid fa-spinner fa-spin me-2"></i>Yükleniyor...</li>';
    
    const modalElement = document.getElementById('historyModal');
    if (!modalElement) return;

    let myModal = bootstrap.Modal.getInstance(modalElement);
    if (!myModal) { myModal = new bootstrap.Modal(modalElement); }
    myModal.show();

    try {
        const response = await fetch(`${API_URL}/plants/${plantId}/history`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        const logs = await response.json();
        
        listEl.innerHTML = '';
        if (!logs || logs.length === 0) {
            listEl.innerHTML = '<li class="text-center text-muted py-3">Henüz sulama kaydı yok.</li>';
            return;
        }
        
        logs.forEach((log) => {
            const logId = log.id;
            listEl.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent py-2 border-bottom border-light">
                    <span><i class="fa-solid fa-droplet text-info me-2"></i>Sulamam gerçekleşti</span>
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-light text-dark border font-monospace">${log.sulama_tarihi}</span>
                        <button class="btn btn-link text-danger p-0 lh-1" onclick="deleteHistoryLog(${logId}, ${plantId})" title="Bu kaydı sil">
                            <i class="fa-solid fa-trash-can small"></i>
                        </button>
                    </div>
                </li>`;
        });
    } catch (err) {
        listEl.innerHTML = '<li class="text-danger text-center py-2">Veriler yüklenirken hata oluştu!</li>';
    }
}

async function deleteHistoryLog(logId, plantId) {
    if (!logId) {
        alert('Log ID bulunamadı!');
        return;
    }
    
    if (!confirm('Bu sulama kaydını silmek istediğinize emin misiniz?')) return;

    try {
        const response = await fetch(`${API_URL}/plants/history/${logId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        const result = await response.json();

        if (response.ok) {
            showHistory(plantId);
            fetchPlants(); 
        } else {
            alert('Kayıt silinemedi: ' + (result.error || 'Bilinmeyen hata'));
        }
    } catch (err) {
        console.error('Silme hatası:', err);
    }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentFilter = e.currentTarget.getAttribute('data-filter');
        renderPlants(); 
    });
});

checkAuth();

// ACİL DURUMDAKİ BİTKİLERİ KONTROL EDİP BİLDİRİM ATAN FONKSİYON
function sendWateringNotification(plants) {
    // Tarayıcıdan bildirim izni var mı kontrol et
    if (Notification.permission !== "granted") return;

 
    const acilBitkiler = plants.filter(plant => {
        return plant.durum === "Acil" || plant.status === "Acil"; 
    });

    // Eğer acil sulanması gereken bitki varsa bildirim fırlat
    if (acilBitkiler.length > 0) {
        // Tek bir bildirimde kaç tane acil bitki olduğunu söyleyelim
        new Notification("Botanika Akıllı Uyarı! 🌿", {
            body: `Şu an sulama zamanı geçmiş ${acilBitkiler.length} adet bitkiniz var. Onları susuz bırakmayın!`,
            icon: "https://cdn-icons-png.flaticon.com/512/628/628283.png" // Tatlı bir yaprak ikonu
        });
    }
}

// TOPRAK, İLAÇ VE AŞI BAKIM TARİHLERİNİ ANLIK GÜNCELLEYEN ORTAK FONKSİYON
async function updateCare(plantId, careType) {
    const bugun = new Date().toISOString().split('T')[0]; // Bugünün tarihini YYYY-MM-DD formatında alır
    
    try {
        const response = await fetch(`${API_URL}/plants/${plantId}/care`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ careType, date: bugun })
        });

        if (response.ok) {
            fetchPlants(); // Bilgileri yeniden çek ve kartları taze taze güncelle!
        } else {
            alert("Bakım tarihi güncellenirken bir hata oluştu.");
        }
    } catch (err) {
        console.error("Bakım güncelleme hatası:", err);
    }
}