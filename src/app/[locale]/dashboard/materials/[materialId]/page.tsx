import {routes, serverFetch} from "@/lib/fetcher";
import { Material } from '@/interfaces/material.interface';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import MaterialForm from "@/components/blocks/dashboard/materials/material-form";

export default async function MaterialPage({
                                               params,
                                           }: {
    params: Promise<{ materialId: string }>
}) {
    const t = await getTranslations();
    const materialId = (await params).materialId;

    const isEdit = materialId === 'new';

    let material: Material | undefined = undefined;
    if (!isEdit) {
        const res = await serverFetch(`${routes.material}/${materialId}`);
        material = res.data;
        if (!material) return notFound();
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                {isEdit ? t('Materials.Table.editMaterial') : t('Materials.Table.addMaterial')}
            </h1>

             <MaterialForm initialData={material} />
        </div>
    )
}
