'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, Trash2 } from 'lucide-react';
import { Customization, CustomizationOption } from '@/interfaces/product.interface';
import { Material } from '@/interfaces/material.interface';
import { CustomizationTypes, Mountings } from '@/lib/const';
import { useTranslations } from 'next-intl';
import MaterialSelectionModal from './material-selection-modal';
import { PaginatedData } from '@/interfaces/paginated-data.interface';
import MultipleSelector, { Option } from '@/components/ui/multi-select';
import { useToast } from '@/hooks/use-toast';
import { routes, submitData } from '@/lib/fetcher';
import { useSession } from 'next-auth/react';
import { refreshData } from '@/lib/server-actions';
import { Input } from '@/components/ui/input';

interface CustomizationConfiguratorProps {
    productId: string;
    customizations: Customization[];
    materials: PaginatedData<Material>;
}

interface MaterialSectionProps {
    title: string;
    materials: Material[];
    selectedMaterialIds: string[];
    onAddMaterials: () => void;
    onRemoveMaterial: (materialId: string) => void;
    onClearAll: () => void;
}

const MaterialSection: React.FC<MaterialSectionProps> = ({
    title,
    materials,
    selectedMaterialIds,
    onAddMaterials,
    onRemoveMaterial,
    onClearAll
}) => {
    const t = useTranslations('Products.Customization');
    const [searchTerm, setSearchTerm] = useState('');
    
    const selectedMaterials = selectedMaterialIds.map(materialId => {
        const material = materials.find(m => m.id === materialId);
        return {
            id: materialId,
            alias: material?.productAlias || materialId
        };
    });

    const filteredMaterials = useMemo(() => {
        if (!searchTerm) return selectedMaterials;
        const searchValue = searchTerm.toLowerCase();
        return selectedMaterials.filter(material =>
            material.alias.toLowerCase().includes(searchValue) ||
            material.id.toLowerCase().includes(searchValue)
        );
    }, [selectedMaterials, searchTerm]);

    return (
        <div>
            <Label className="text-lg font-bold">{title}</Label>
            <div className="flex items-center justify-between mb-2">
                <Input
                    placeholder={t('searchMaterials')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[20%]"
                    disabled={selectedMaterialIds.length === 0}
                />
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearAll}
                        className="text-destructive hover:text-destructive"
                        disabled={selectedMaterialIds.length === 0}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('clearAll')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAddMaterials}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addMaterials')}
                    </Button>
                </div>
            </div>
            
            <ScrollArea className="h-24 w-full border rounded-md p-2">
                <div className="flex flex-wrap gap-2">
                    {filteredMaterials.map((material) => (
                        <Badge key={material.id} variant="secondary" className="flex items-center gap-1">
                            {material.alias}
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => onRemoveMaterial(material.id)}
                            />
                        </Badge>
                    ))}
                    {filteredMaterials.length === 0 && searchTerm && (
                        <p className="text-sm text-muted-foreground">{t('noMaterialsFound')}</p>
                    )}
                    {selectedMaterials.length === 0 && (
                        <p className="text-sm text-muted-foreground">{t('noMaterials')}</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

interface MountingCardProps {
    option: CustomizationOption;
    materials: Material[];
    onUpdate: (updatedOption: CustomizationOption) => void;
    onAddMaterials: (optionValue: string) => void;
}

const MountingCard: React.FC<MountingCardProps> = ({ option, materials, onUpdate, onAddMaterials }) => {
    const t = useTranslations('Products.Customization');
    const [useRalColor, setUseRalColor] = useState(option.colorStandard === 'RAL');

    const handleRalColorChange = (checked: boolean) => {
        setUseRalColor(checked);
        const updatedOption = {
            ...option,
            colorStandard: checked ? 'RAL' : undefined,
            materials: checked ? [] : option.materials
        };
        onUpdate(updatedOption);
    };

    const handleRemoveMaterial = (materialId: string) => {
        const updatedOption = {
            ...option,
            materials: option.materials?.filter(id => id !== materialId) || []
        };
        onUpdate(updatedOption);
    };

    if (option.value === Mountings.Ceiling) {
        return null;
    }

    const showRalOption = option.value === Mountings.AluminumFrame || option.value === Mountings.ChainFrame;

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-lg">{t(`mounting.options.${option.value}`)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {showRalOption && (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`ral-${option.value}`}
                            checked={useRalColor}
                            onCheckedChange={handleRalColorChange}
                        />
                        <Label htmlFor={`ral-${option.value}`}>{t('mounting.ralColorStandard')}</Label>
                    </div>
                )}

                {!useRalColor && (
                    <MaterialSection
                        title={t('mounting.materials')}
                        materials={materials}
                        selectedMaterialIds={option.materials || []}
                        onAddMaterials={() => onAddMaterials(option.value)}
                        onRemoveMaterial={handleRemoveMaterial}
                        onClearAll={() => {
                            const updatedOption = {
                                ...option,
                                materials: []
                            };
                            onUpdate(updatedOption);
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
};

export const CustomizationConfigurator: React.FC<CustomizationConfiguratorProps> = ({
    productId,
    customizations,
    materials,
}) => {
    const { toast } = useToast();
    const t = useTranslations('Products.Customization');
    const tMessages = useTranslations('Messages');
    const { data: session } = useSession();
    const [localCustomizations, setLocalCustomizations] = useState<Customization[]>(customizations);
    const [materialSelectionModal, setMaterialSelectionModal] = useState<{
        isOpen: boolean;
        type: string;
        mountingOptionValue?: string;
    }>({ isOpen: false, type: '' });

    useEffect(() => {
        setLocalCustomizations(customizations);
    }, [customizations]);

    const mountingOptions: Option[] = [
        { value: Mountings.Wall, label: t(`mounting.options.${Mountings.Wall}`) },
        { value: Mountings.CutBond, label: t(`mounting.options.${Mountings.CutBond}`) },
        { value: Mountings.SquareBond, label: t(`mounting.options.${Mountings.SquareBond}`) },
        { value: Mountings.AluminumFrame, label: t(`mounting.options.${Mountings.AluminumFrame}`) },
        { value: Mountings.ChainFrame, label: t(`mounting.options.${Mountings.ChainFrame}`) },
        { value: Mountings.Ceiling, label: t(`mounting.options.${Mountings.Ceiling}`) }
    ];

    const getCustomizationByType = (type: string): Customization | undefined => {
        return localCustomizations.find(c => c.type === type);
    };

    const updateCustomization = (type: string, updates: Partial<Customization>) => {
        setLocalCustomizations(prev => {
            const existingIndex = prev.findIndex(c => c.type === type);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], ...updates };
                return updated;
            } else {
                return [...prev, { type, ...updates } as Customization];
            }
        });
    };

    const handleAddMaterials = (type: string, mountingOptionValue?: string) => {
        setMaterialSelectionModal({
            isOpen: true,
            type,
            mountingOptionValue
        });
    };

    const handleMaterialsSelected = (selectedMaterials: Material[]) => {
        const { type, mountingOptionValue } = materialSelectionModal;
        const materialIds = selectedMaterials.map(m => m.id);

        if (type === CustomizationTypes.Mounting && mountingOptionValue) {
            // Handle mounting option materials
            const mountingCustomization = getCustomizationByType(CustomizationTypes.Mounting);
            if (mountingCustomization?.options) {
                const updatedOptions = mountingCustomization.options.map(opt => {
                    if (opt.value === mountingOptionValue) {
                        return {
                            ...opt,
                            materials: [...(opt.materials || []), ...materialIds].filter((id, index, arr) => arr.indexOf(id) === index)
                        };
                    }
                    return opt;
                });
                updateCustomization(CustomizationTypes.Mounting, { options: updatedOptions });
            }
        } else {
            // Handle regular customization materials
            const existingCustomization = getCustomizationByType(type);
            const existingMaterials = existingCustomization?.materials || [];
            const newMaterials = [...existingMaterials, ...materialIds].filter((id, index, arr) => arr.indexOf(id) === index);
            updateCustomization(type, { materials: newMaterials });
        }

        setMaterialSelectionModal({ isOpen: false, type: '' });
    };

    const handleRemoveMaterial = (type: string, materialId: string, mountingOptionValue?: string) => {
        if (type === CustomizationTypes.Mounting && mountingOptionValue) {
            const mountingCustomization = getCustomizationByType(CustomizationTypes.Mounting);
            if (mountingCustomization?.options) {
                const updatedOptions = mountingCustomization.options.map(opt => {
                    if (opt.value === mountingOptionValue) {
                        return {
                            ...opt,
                            materials: opt.materials?.filter(id => id !== materialId) || []
                        };
                    }
                    return opt;
                });
                updateCustomization(CustomizationTypes.Mounting, { options: updatedOptions });
            }
        } else {
            const existingCustomization = getCustomizationByType(type);
            if (existingCustomization?.materials) {
                const updatedMaterials = existingCustomization.materials.filter(id => id !== materialId);
                updateCustomization(type, { materials: updatedMaterials });
            }
        }
    };

    const handleMountingOptionUpdate = (updatedOption: CustomizationOption) => {
        const mountingCustomization = getCustomizationByType(CustomizationTypes.Mounting);
        if (!mountingCustomization?.options) return;

        const updatedOptions = mountingCustomization.options.map(opt =>
            opt.value === updatedOption.value ? updatedOption : opt
        );

        updateCustomization(CustomizationTypes.Mounting, {
            options: updatedOptions
        });
    };

    const handleMountingOptionsChange = (selectedOptions: Option[]) => {
        const newOptions: CustomizationOption[] = selectedOptions.map(option => ({
            value: option.value,
            materials: [],
            colorStandard: undefined
        }));

        updateCustomization(CustomizationTypes.Mounting, {
            options: newOptions
        });
    };

    const handleSave = async () => {
        let response;

        try {
            response = await submitData(`${routes.product}/${productId}`, (session as any).accessToken, {
                id: productId,
                customizations: localCustomizations
            });

            if (response.error) {
                toast({
                    variant: 'default',
                    title: tMessages('genericError'),
                    description: tMessages('somethingWentWrong'),
                });
                console.error(response.error);
            } else {
                toast({
                    variant: 'default',
                    title: tMessages('success'),
                    description: t('customizationSaved')
                });

                await refreshData(`${routes.product}`);
            }
        } catch (e: any) {
            toast({
                variant: 'default',
                title: tMessages('genericError'),
                description: tMessages('somethingWentWrong'),
            });
        }
    };

    const faceColorsCustomization = getCustomizationByType(CustomizationTypes.FaceColors);
    const sideColorsCustomization = getCustomizationByType(CustomizationTypes.SideColors);
    const extraColorsCustomization = getCustomizationByType(CustomizationTypes.ExtraColors);
    const ledColorsCustomization = getCustomizationByType(CustomizationTypes.LedColors);
    const mountingCustomization = getCustomizationByType(CustomizationTypes.Mounting);

    const selectedMountingOptions: Option[] = (mountingCustomization?.options || [])
        .map(option => mountingOptions.find(mo => mo.value === option.value))
        .filter((option): option is Option => option !== undefined);

    return (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            <div className="space-y-6">
                {/* Face Colors */}
                <MaterialSection
                    title={t('sections.faceColors')}
                    materials={materials.rows}
                    selectedMaterialIds={faceColorsCustomization?.materials || []}
                    onAddMaterials={() => handleAddMaterials(CustomizationTypes.FaceColors)}
                    onRemoveMaterial={(materialId) => handleRemoveMaterial(CustomizationTypes.FaceColors, materialId)}
                    onClearAll={() => updateCustomization(CustomizationTypes.FaceColors, { materials: [] })}
                />

                {/* Side Colors */}
                <MaterialSection
                    title={t('sections.sideColors')}
                    materials={materials.rows}
                    selectedMaterialIds={sideColorsCustomization?.materials || []}
                    onAddMaterials={() => handleAddMaterials(CustomizationTypes.SideColors)}
                    onRemoveMaterial={(materialId) => handleRemoveMaterial(CustomizationTypes.SideColors, materialId)}
                    onClearAll={() => updateCustomization(CustomizationTypes.SideColors, { materials: [] })}
                />
                
                {/* Side Colors */}
                <MaterialSection
                    title={t('sections.extraColors')}
                    materials={materials.rows}
                    selectedMaterialIds={extraColorsCustomization?.materials || []}
                    onAddMaterials={() => handleAddMaterials(CustomizationTypes.ExtraColors)}
                    onRemoveMaterial={(materialId) => handleRemoveMaterial(CustomizationTypes.ExtraColors, materialId)}
                    onClearAll={() => updateCustomization(CustomizationTypes.ExtraColors, { materials: [] })}
                />

                {/* LED Colors */}
                <MaterialSection
                    title={t('sections.ledColors')}
                    materials={materials.rows}
                    selectedMaterialIds={ledColorsCustomization?.materials || []}
                    onAddMaterials={() => handleAddMaterials(CustomizationTypes.LedColors)}
                    onRemoveMaterial={(materialId) => handleRemoveMaterial(CustomizationTypes.LedColors, materialId)}
                    onClearAll={() => updateCustomization(CustomizationTypes.LedColors, { materials: [] })}
                />

                {/* Mounting Options */}
                <div>
                    <Label className="text-lg font-bold">{t('sections.mounting')}</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('mountingDescription')}
                    </p>

                    <MultipleSelector
                        value={selectedMountingOptions}
                        onChange={handleMountingOptionsChange}
                        options={mountingOptions}
                        placeholder={t('mounting.selectMountingOptions')}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                {t('mounting.noMountingOptions')}
                            </p>
                        }
                    />

                    {/* Render mounting option cards for selected options */}
                    {mountingCustomization?.options?.map(option => (
                        <MountingCard
                            key={option.value}
                            option={option}
                            materials={materials.rows}
                            onUpdate={handleMountingOptionUpdate}
                            onAddMaterials={(optionValue) => handleAddMaterials(CustomizationTypes.Mounting, optionValue)}
                        />
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t">
                <Button onClick={handleSave} size="lg">
                    {t('saveButton')}
                </Button>
            </div>

            {/* Material Selection Modal */}
            <MaterialSelectionModal
                isOpen={materialSelectionModal.isOpen}
                onOpenChange={(open) => setMaterialSelectionModal(prev => ({ ...prev, isOpen: open }))}
                materials={materials}
                onMaterialsSelected={handleMaterialsSelected}
            />
        </div>
    );
};

export default CustomizationConfigurator;
