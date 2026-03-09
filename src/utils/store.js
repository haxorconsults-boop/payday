// Payday — localStorage Data Store (CRUD + Sessions)

const STORE_PREFIX = 'ibc_';

function getCollection(name) {
    const data = localStorage.getItem(STORE_PREFIX + name);
    return data ? JSON.parse(data) : [];
}

function setCollection(name, data) {
    localStorage.setItem(STORE_PREFIX + name, JSON.stringify(data));
}

function generateId() {
    return crypto.randomUUID ? crypto.randomUUID() :
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
}

// ========== GENERIC CRUD ==========

export const store = {
    // Get all items in a collection
    getAll(collection) {
        return getCollection(collection);
    },

    // Get a single item by ID
    getById(collection, id) {
        return getCollection(collection).find(item => item.id === id) || null;
    },

    // Find items matching a predicate
    find(collection, predicate) {
        return getCollection(collection).filter(predicate);
    },

    // Find first item matching predicate
    findOne(collection, predicate) {
        return getCollection(collection).find(predicate) || null;
    },

    // Create a new item
    create(collection, data) {
        const items = getCollection(collection);
        const newItem = {
            id: generateId(),
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        items.push(newItem);
        setCollection(collection, items);
        return newItem;
    },

    // Update an item by ID
    update(collection, id, updates) {
        const items = getCollection(collection);
        const idx = items.findIndex(item => item.id === id);
        if (idx === -1) return null;
        items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
        setCollection(collection, items);
        return items[idx];
    },

    // Delete an item by ID
    remove(collection, id) {
        const items = getCollection(collection);
        const filtered = items.filter(item => item.id !== id);
        setCollection(collection, filtered);
        return filtered.length < items.length;
    },

    // Count items
    count(collection, predicate) {
        const items = getCollection(collection);
        return predicate ? items.filter(predicate).length : items.length;
    },

    // Sum a numeric field
    sum(collection, field, predicate) {
        const items = predicate ? getCollection(collection).filter(predicate) : getCollection(collection);
        return items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
    },

    // Clear a collection
    clear(collection) {
        setCollection(collection, []);
    }
};

// ========== SESSION MANAGEMENT ==========

export const session = {
    setCurrentUser(user) {
        localStorage.setItem(STORE_PREFIX + 'current_user', JSON.stringify(user));
    },

    getCurrentUser() {
        const data = localStorage.getItem(STORE_PREFIX + 'current_user');
        return data ? JSON.parse(data) : null;
    },

    clearCurrentUser() {
        localStorage.removeItem(STORE_PREFIX + 'current_user');
    },

    setAdminAuth(admin) {
        localStorage.setItem(STORE_PREFIX + 'admin_auth', JSON.stringify(admin));
    },

    getAdminAuth() {
        const data = localStorage.getItem(STORE_PREFIX + 'admin_auth');
        return data ? JSON.parse(data) : null;
    },

    clearAdminAuth() {
        localStorage.removeItem(STORE_PREFIX + 'admin_auth');
    },

    setEmployerAuth(employer) {
        localStorage.setItem(STORE_PREFIX + 'employer_auth', JSON.stringify(employer));
    },

    getEmployerAuth() {
        const data = localStorage.getItem(STORE_PREFIX + 'employer_auth');
        return data ? JSON.parse(data) : null;
    },

    clearEmployerAuth() {
        localStorage.removeItem(STORE_PREFIX + 'employer_auth');
    },

    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    isAdmin() {
        return !!this.getAdminAuth();
    },

    isEmployer() {
        return !!this.getEmployerAuth();
    },

    logout() {
        this.clearCurrentUser();
        this.clearAdminAuth();
        this.clearEmployerAuth();
    }
};

// ========== AUDIT LOGGING ==========

export function auditLog(actorType, actorId, action, entity, entityId, meta = {}) {
    store.create('audit_logs', {
        actor_type: actorType,
        actor_id: actorId,
        action,
        entity,
        entity_id: entityId,
        meta
    });
}

export function isSeeded() {
    return localStorage.getItem(STORE_PREFIX + 'seeded') === 'true';
}

export function markSeeded() {
    localStorage.setItem(STORE_PREFIX + 'seeded', 'true');
}
