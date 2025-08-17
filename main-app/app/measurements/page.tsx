'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Plus, Search, Scissors, Settings, Copy, Trash } from 'react-feather';
import { Button, Modal, ActionsMenu } from '@/components/ui';
import PresetForm from '@/components/measurements/PresetForm';
import PresetCard from '@/components/measurements/PresetCard';
import CustomMeasurementForm from '@/components/measurements/CustomMeasurementForm';
import styles from '@/styles/components/measurement-card.module.css';
import modalStyles from '@/styles/components/modal.module.css';
import formStyles from '@/styles/components/auth.module.css';
import customerStyles from '@/styles/components/customer-detail.module.css';
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
} from 'firebase/firestore';
import { MeasurementPreset, CustomMeasurement } from '@/lib/types';

const MeasurementsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingPreset, setEditingPreset] = useState<MeasurementPreset | null>(null);
    const [editingCustomMeasurement, setEditingCustomMeasurement] = useState<CustomMeasurement | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'preset' | 'custom' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: presets, loading: presetsLoading } = useFirestoreQuery<MeasurementPreset>({
        path: 'measurementPresets',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const { data: customMeasurements, loading: customMeasurementsLoading } = useFirestoreQuery<CustomMeasurement>({
        path: 'customMeasurements',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const filteredPresets = useMemo(() => {
        if (!presets) return [];
        return presets.filter(
            (preset) =>
                preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (preset.garmentType && preset.garmentType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                preset.gender.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [presets, searchTerm]);

    const filteredCustomMeasurements = useMemo(() => {
        if (!customMeasurements) return [];
        return customMeasurements.filter(
            (cm) =>
                cm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cm.shortForm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cm.gender.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customMeasurements, searchTerm]);

    const handleAddNew = () => {
        if (activeTab === 'presets') {
            setEditingPreset(null);
        } else {
            setEditingCustomMeasurement(null);
        }
        setIsModalOpen(true);
    };

    const handleEditPreset = (preset: MeasurementPreset) => {
        setEditingPreset(preset);
        setIsModalOpen(true);
    };

    const handleEditCustomMeasurement = (cm: CustomMeasurement) => {
        setEditingCustomMeasurement(cm);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPreset(null);
        setEditingCustomMeasurement(null);
    };

    const handleSavePreset = async (data: Partial<MeasurementPreset>) => {
        if (!user) return;
        setIsSaving(true);
        try {
            if (editingPreset) {
                const presetRef = doc(db, 'measurementPresets', editingPreset.id);
                await updateDoc(presetRef, {
                    ...data,
                    updatedAt: serverTimestamp(),
                });
            } else {
                await addDoc(collection(db, 'measurementPresets'), {
                    ...data,
                    userId: user.uid,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving preset:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveCustomMeasurement = async (data: Partial<CustomMeasurement>) => {
        if (!user) return;
        setIsSaving(true);
        try {
            if (editingCustomMeasurement) {
                const cmRef = doc(db, 'customMeasurements', editingCustomMeasurement.id);
                await updateDoc(cmRef, {
                    ...data,
                    updatedAt: serverTimestamp(),
                });
            } else {
                await addDoc(collection(db, 'customMeasurements'), {
                    ...data,
                    userId: user.uid,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving custom measurement:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, type: 'preset' | 'custom') => {
        setItemToDelete({ id, type });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const collectionName = itemToDelete.type === 'preset' ? 'measurementPresets' : 'customMeasurements';
            await deleteDoc(doc(db, collectionName, itemToDelete.id));
        } catch (error) {
            console.error('Error deleting item: ', error);
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleCopyPreset = (preset: MeasurementPreset) => {
        setEditingPreset({
            ...preset,
            id: '',
            name: `${preset.name} (Copy)`,
            createdAt: undefined,
            updatedAt: undefined,
        });
        setIsModalOpen(true);
    };

    const loading = presetsLoading || customMeasurementsLoading;
    const currentItems = activeTab === 'presets' ? filteredPresets : filteredCustomMeasurements;
    const hasItems = activeTab === 'presets' ? (presets && presets.length > 0) : (customMeasurements && customMeasurements.length > 0);

    return (
        <DashboardLayout title="Measurement Management" breadcrumb="Measurement Management">
            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--neutral-200)',
                marginBottom: 'var(--space-6)'
            }}>
                <button
                    onClick={() => setActiveTab('presets')}
                    style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: activeTab === 'presets' ? '2px solid var(--primary-500)' : '2px solid transparent',
                        color: activeTab === 'presets' ? 'var(--primary-600)' : 'var(--neutral-600)',
                        fontWeight: activeTab === 'presets' ? 'var(--font-semibold)' : 'var(--font-medium)',
                        background: 'none',
                        cursor: 'pointer',
                    }}
                >
                    Presets
                </button>
                <button
                    onClick={() => setActiveTab('custom')}
                    style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: activeTab === 'custom' ? '2px solid var(--primary-500)' : '2px solid transparent',
                        color: activeTab === 'custom' ? 'var(--primary-600)' : 'var(--neutral-600)',
                        fontWeight: activeTab === 'custom' ? 'var(--font-semibold)' : 'var(--font-medium)',
                        background: 'none',
                        cursor: 'pointer',
                    }}
                >
                    Custom
                </button>
            </div>

            {/* Search and Add Section */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-6)',
                    gap: 'var(--space-4)',
                }}
            >
                <div style={{ position: 'relative', flex: '1' }}>
                    <Search
                        size={20}
                        style={{
                            position: 'absolute',
                            left: 'var(--space-4)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--neutral-400)',
                        }}
                    />
                    <input
                        type="text"
                        placeholder={activeTab === 'presets'
                            ? "Search by name, garment type, or gender..."
                            : "Search by name, short form, or gender..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={formStyles.input}
                        style={{ paddingLeft: 'var(--space-10)', width: '100%' }}
                    />
                </div>
                {hasItems && (
                    <Button onClick={handleAddNew} style={{ flexShrink: 0, minWidth: '48px', padding: 'var(--space-3)' }}>
                        <Plus size={20} />
                    </Button>
                )}
            </div>

            {/* Content Grid */}
            {loading && (
                <>
                    <div className={`desktop-only ${styles.measurementGrid}`}>
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                backgroundColor: 'var(--neutral-0)',
                                borderRadius: 'var(--radius-xl)',
                                height: '280px',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            }}
                        />
                    ))}
                </div>
                    <div className={`mobile-only ${customerStyles.mobileList}`}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={customerStyles.mobileListItem} style={{ height: '88px' }} />
                        ))}
                    </div>
                </>
            )}

            {!loading && currentItems.length > 0 && (
                <>
                    {/* Desktop cards */}
                    <div className={`desktop-only ${styles.measurementGrid}`}>
                        {activeTab === 'presets' ? (
                            filteredPresets.map((preset) => (
                                <PresetCard
                                    key={preset.id}
                                    preset={preset}
                                    onEdit={handleEditPreset}
                                    onDelete={(id) => handleDelete(id, 'preset')}
                                    onCopy={handleCopyPreset}
                                />
                            ))
                        ) : (
                            filteredCustomMeasurements.map((cm) => (
                                <div key={cm.id} className={styles.measurementCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.headerInfo}>
                                            <h3 className={styles.garmentType}>{cm.name}</h3>
                                            <p className={styles.customerName}>
                                                Short form: {cm.shortForm}
                                            </p>
                                        </div>
                                        <span className={styles.genderTag} data-gender={cm.gender}>
                                            {cm.gender === 'women' ? 'Female' : cm.gender === 'men' ? 'Male' : 'Both'}
                                        </span>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <span className={styles.dateSpan}>
                                            Unit: {cm.unit}
                                        </span>
                                        <div className={styles.footerActions}>
                                            <button
                                                className={styles.openButton}
                                                onClick={() => handleEditCustomMeasurement(cm)}
                                            >
                                                <Settings size={16} />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                className={styles.openButton}
                                                onClick={() => handleDelete(cm.id, 'custom')}
                                                style={{ backgroundColor: 'var(--error-500)' }}
                                            >
                                                <Scissors size={16} />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {/* Mobile list */}
                    <div className={`mobile-only ${customerStyles.mobileList}`}>
                        {activeTab === 'presets' ? (
                            filteredPresets.map((preset) => (
                                <div key={preset.id} className={customerStyles.mobileListItem}>
                                    <div className={customerStyles.mobileItemHeader}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 className={customerStyles.mobileItemTitle}>{preset.name}</h3>
                                            <div className={customerStyles.mobileItemSubtitle}>{preset.garmentType}</div>
                                        </div>
                                        <span style={{
                                            background: preset.gender === 'women'
                                                ? 'linear-gradient(135deg, var(--accent-pink) 0%, rgba(236, 72, 153, 0.9) 100%)'
                                                : 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                                            color: 'var(--neutral-0)',
                                            padding: 'var(--space-1) var(--space-2)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: 'var(--text-xs)',
                                            fontWeight: 'var(--font-bold)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        }}>
                                            {preset.gender === 'women' ? 'Female' : 'Male'}
                                        </span>
                                    </div>
                                    <div className={customerStyles.mobileItemMeta}>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)' }}>
                                            <span className={customerStyles.mobileMetaKey}>Unit:</span> {preset.unit}
                                        </div>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)' }}>
                                            <span className={customerStyles.mobileMetaKey}>Fields:</span> {Object.keys(preset.values).length}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <button
                                            style={{
                                                background: 'var(--primary-500)',
                                                color: 'var(--neutral-0)',
                                                border: 'none',
                                                borderRadius: 'var(--radius-md)',
                                                padding: 'var(--space-2) var(--space-3)',
                                                fontSize: 'var(--text-sm)',
                                                fontWeight: 'var(--font-semibold)',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleEditPreset(preset)}
                                        >
                                            Edit
                                        </button>
                                        <ActionsMenu
                                            items={[
                                                { label: 'Copy', icon: <Copy />, onClick: () => handleCopyPreset(preset) },
                                                { label: 'Delete', icon: <Trash />, onClick: () => handleDelete(preset.id, 'preset'), isDanger: true },
                                            ]}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            filteredCustomMeasurements.map((cm) => (
                                <div key={cm.id} className={customerStyles.mobileListItem}>
                                    <div className={customerStyles.mobileItemHeader}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 className={customerStyles.mobileItemTitle}>{cm.name}</h3>
                                            <div className={customerStyles.mobileItemSubtitle}>Short form: {cm.shortForm}</div>
                                        </div>
                                        <span style={{
                                            background: cm.gender === 'women'
                                                ? 'linear-gradient(135deg, var(--accent-pink) 0%, rgba(236, 72, 153, 0.9) 100%)'
                                                : cm.gender === 'men'
                                                    ? 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)'
                                                    : 'linear-gradient(135deg, var(--accent-purple) 0%, rgba(139, 92, 246, 0.9) 100%)',
                                            color: 'var(--neutral-0)',
                                            padding: 'var(--space-1) var(--space-2)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: 'var(--text-xs)',
                                            fontWeight: 'var(--font-bold)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        }}>
                                            {cm.gender === 'women' ? 'Female' : cm.gender === 'men' ? 'Male' : 'Both'}
                                        </span>
                                    </div>
                                    <div className={customerStyles.mobileItemMeta}>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)' }}>
                                            <span className={customerStyles.mobileMetaKey}>Unit:</span> {cm.unit}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <button
                                            style={{
                                                background: 'var(--primary-500)',
                                                color: 'var(--neutral-0)',
                                                border: 'none',
                                                borderRadius: 'var(--radius-md)',
                                                padding: 'var(--space-2) var(--space-3)',
                                                fontSize: 'var(--text-sm)',
                                                fontWeight: 'var(--font-semibold)',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleEditCustomMeasurement(cm)}
                                        >
                                            Edit
                                        </button>
                                        <ActionsMenu
                                            items={[
                                                { label: 'Delete', icon: <Trash />, onClick: () => handleDelete(cm.id, 'custom'), isDanger: true },
                                            ]}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                </div>
                </>
            )}

            {!loading && (!hasItems || currentItems.length === 0) && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                        padding: 'var(--space-8)',
                        backgroundColor: 'var(--neutral-0)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--neutral-200)',
                        boxShadow: 'var(--shadow-sm)',
                    }}
                >
                    <Scissors
                        size={48}
                        style={{
                            color: 'var(--neutral-400)',
                            marginBottom: 'var(--space-4)',
                        }}
                    />
                    <h2
                        style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-semibold)',
                            marginBottom: 'var(--space-4)',
                            color: 'var(--neutral-900)',
                        }}
                    >
                        {searchTerm ? 'No Items Found' : activeTab === 'presets' ? 'No Presets Yet' : 'No Custom Measurements Yet'}
                    </h2>
                    <p
                        style={{
                            fontSize: 'var(--text-base)',
                            color: 'var(--neutral-600)',
                            marginBottom: 'var(--space-6)',
                            lineHeight: 'var(--leading-relaxed)',
                        }}
                    >
                        {searchTerm
                            ? 'Try adjusting your search terms.'
                            : activeTab === 'presets'
                                ? 'Create measurement presets to speed up your workflow when taking measurements for customers.'
                                : 'Add custom measurement fields that aren\'t in the standard list.'
                        }
                    </p>
                    <Button onClick={handleAddNew}>
                        <Scissors size={20} style={{ marginRight: 'var(--space-2)' }} />
                        {activeTab === 'presets' ? 'Create First Preset' : 'Add First Custom Measurement'}
                    </Button>
                </div>
            )}

            {/* Modals */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={
                    activeTab === 'presets'
                        ? (editingPreset ? 'Edit Preset' : 'Create New Preset')
                        : (editingCustomMeasurement ? 'Edit Custom Measurement' : 'Add Custom Measurement')
                }
            >
                {activeTab === 'presets' ? (
                    <PresetForm
                        onSave={handleSavePreset}
                        onClose={handleCloseModal}
                        isSaving={isSaving}
                        defaultValues={editingPreset || undefined}
                    />
                ) : (
                    <CustomMeasurementForm
                        onSave={handleSaveCustomMeasurement}
                    onClose={handleCloseModal}
                    isSaving={isSaving}
                        defaultValues={editingCustomMeasurement || undefined}
                />
                )}
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <p>
                    Are you sure you want to delete this {itemToDelete?.type === 'preset' ? 'preset' : 'custom measurement'}? This action
                    cannot be undone.
                </p>
                <div className={modalStyles.modalFooter}>
                    <Button
                        variant="secondary"
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default MeasurementsPage; 