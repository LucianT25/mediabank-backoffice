'use client'

import {
    addEdge,
    Background,
    Connection,
    Controls,
    Edge,
    Handle,
    NodeResizer,
    MarkerType,
    NodeProps,
    Position,
    ReactFlow,
    ReactFlowProvider,
    useReactFlow,
    useEdgesState,
    useNodeConnections,
    useNodesState
} from '@xyflow/react'
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react'
import {nanoid} from 'nanoid'
import {Product, ProductType} from '@/interfaces/product.interface'
import {Label} from '@/components/ui/label'
import {Button} from '@/components/ui/button'

import '@xyflow/react/dist/style.css';
import {Material} from '@/interfaces/material.interface'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {routes, submitData} from "@/lib/fetcher";
import {useSession} from 'next-auth/react'
import {useToast} from "@/hooks/use-toast";
import {useTranslations} from "next-intl";
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip'
import {Badge} from "@/components/ui/badge";
import {Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {Check, ChevronsUpDown, Lock, Unlock } from 'lucide-react'
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import ColorPicker from '@/components/ui/color-picker'

const DeleteButton = ({onClick}: { onClick: () => void }) => {
    const tMessages = useTranslations()
    return (
    <button
        onClick={(e) => {
            e.stopPropagation()
            onClick()
        }}
        className="absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full px-1"
            title={tMessages('Manufacturers.PriceEngine.deleteNode')}
    >
        ×
    </button>
)
}

const VariableNode = memo(({id, data}: NodeProps<any>) => {
    const tMessages = useTranslations();

    return (
        <div className="group p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-md border border-blue-300 text-sm relative min-w-[140px]">
        <DeleteButton onClick={() => data.deleteNode(id)}/>
            
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <Handle 
                    type="source" 
                    position={Position.Right}
                    className="w-3 h-3 bg-blue-600 border-2 border-white"
                />
                <div className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-blue-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {tMessages('Manufacturers.PriceEngine.nodeOutput')}
    </div>
            </div>
            
            <div className="font-bold text-center text-blue-800">
                <div className="text-lg">🔣</div>
                <div className="text-xs leading-tight">
                    {tMessages(`Manufacturers.PriceEngine.${data.value}`)}
                </div>
            </div>
        </div>
    )
})

const ConstantNode = memo(({id, data}: NodeProps<any>) => {
    const tMessages = useTranslations();
    const connections = useNodeConnections({handleType: 'source'})

    return (
        <div className="group p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-lg shadow-md border border-green-300 text-sm relative min-w-[140px]">
        <DeleteButton onClick={() => data.deleteNode(id)}/>
            
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <Handle 
                    type="source" 
                    position={Position.Right} 
                    isConnectable={connections?.length < 1}
                    className="w-3 h-3 bg-green-600 border-2 border-white"
                />
                <div className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-green-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {tMessages('Manufacturers.PriceEngine.nodeOutput')}
                </div>
            </div>
            
            <div className="font-bold text-center text-green-800 mb-2">
                <div className="text-lg">📏</div>
                <div className="text-xs">
                    {tMessages(`Manufacturers.PriceEngine.constant`)}
                </div>
            </div>
            
            <div className="flex items-center justify-center">
        <input
            type="number"
            defaultValue={data.value}
                    onChange={(e) => data.onChange(id, parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 text-xs rounded border border-green-300 focus:border-green-500 focus:outline-none text-center"
                    placeholder="0"
        />
    </div>
        </div>
    )
})

const MaterialPriceNode = memo(({id, data}: NodeProps<any>) => {
    const materials = data.materials || []
    const [open, setOpen] = useState(false)
    const tMessages = useTranslations('');

    return (
        <div className="group p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg shadow-md border border-emerald-300 text-sm relative min-w-[180px]">
            <DeleteButton onClick={() => data.deleteNode(id)}/>
            
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <Handle 
                    type="source" 
                    position={Position.Right}
                    className="w-3 h-3 bg-emerald-600 border-2 border-white"
                />
                <div className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-emerald-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {tMessages('Manufacturers.PriceEngine.nodeOutput')}
                </div>
            </div>
            
            <div className="font-bold text-center text-emerald-800 mb-3">
                <div className="text-lg">🧱</div>
                <div className="text-xs">
                    {tMessages('Manufacturers.PriceEngine.materialPrice')}
                </div>
            </div>
            
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-white/80 border-emerald-300 hover:bg-white"
                    >
                        {data.value
                            ? materials.find((mat: Material) => mat.id === data.value)?.productAlias
                            : tMessages('Misc.search')}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder={tMessages('Misc.search')} className="h-9"/>
                        <CommandList>
                            <CommandEmpty>{tMessages('Misc.noResult')}</CommandEmpty>
                            <CommandGroup>
                                {materials.map((material: Material) => (
                                    <CommandItem
                                        key={material.id}
                                        value={material.productAlias}
                                        onSelect={() => {
                                            data.onChange(id, material.id)
                                            setOpen(false)
                                        }}
                                    >
                                        {material.productAlias}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                data.value === material.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
})

const ConstantMaterialValueNode = memo(({id, data}: NodeProps<any>) => {
    const materials = data.materials || []
    const [open, setOpen] = useState(false)
    const tMessages = useTranslations('');
    const valueType = data.valueType || 'price'

    return (
        <div className="group p-4 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg shadow-md border border-cyan-300 text-sm relative min-w-[180px]">
            <DeleteButton onClick={() => data.deleteNode(id)}/>
            
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <Handle 
                    type="source" 
                    position={Position.Right}
                    className="w-3 h-3 bg-cyan-600 border-2 border-white"
                />
                <div className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-cyan-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {tMessages('Manufacturers.PriceEngine.nodeOutput')}
                </div>
            </div>
            
            <div className="font-bold text-center text-cyan-800 mb-3">
                <div className="text-lg">📦</div>
                <div className="text-xs">
                    {tMessages('Manufacturers.PriceEngine.materialValue')}
                </div>
            </div>
            
            <div className="space-y-2">
                <Select
                    value={valueType}
                    onValueChange={(value) => {
                        data.onChange(id, { valueType: value, materialId: data.materialId })
                    }}
                >
                    <SelectTrigger className="w-full bg-white/80 border-cyan-300 hover:bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="id">{tMessages('Manufacturers.PriceEngine.id')}</SelectItem>
                        <SelectItem value="price">{tMessages('Manufacturers.PriceEngine.price')}</SelectItem>
                        <SelectItem value="weight">{tMessages('Manufacturers.PriceEngine.weight')}</SelectItem>
                        <SelectItem value="consumption">{tMessages('Manufacturers.PriceEngine.consumption')}</SelectItem>
                    </SelectContent>
                </Select>
                
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between bg-white/80 border-cyan-300 hover:bg-white"
                        >
                            {data.materialId
                                ? materials.find((mat: Material) => mat.id === data.materialId)?.productAlias
                                : tMessages('Misc.search')}
                            <ChevronsUpDown className="opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandInput placeholder={tMessages('Misc.search')} className="h-9"/>
                            <CommandList>
                                <CommandEmpty>{tMessages('Misc.noResult')}</CommandEmpty>
                                <CommandGroup>
                                    {materials.map((material: Material) => (
                                        <CommandItem
                                            key={material.id}
                                            value={`${material.productAlias} ${material.id}`}
                                            onSelect={() => {
                                                data.onChange(id, { valueType: valueType, materialId: material.id })
                                                setOpen(false)
                                            }}
                                        >
                                            {material.productAlias} [{material.id}]
                                            <Check
                                                className={cn(
                                                    "ml-auto",
                                                    data.materialId === material.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
})

const VariableMaterialValueNode = memo(({id, data}: NodeProps<any>) => {
    const tMessages = useTranslations('');
    const valueType = data.valueType || 'price'
    const materialVariable = data.materialVariable || 'faceMaterial'

    const materialVariableOptions = [
        { value: 'faceMaterial', label: tMessages('Manufacturers.PriceEngine.faceMaterial') },
        { value: 'sideMaterial', label: tMessages('Manufacturers.PriceEngine.sideMaterial') },
        { value: 'extraMaterial', label: tMessages('Manufacturers.PriceEngine.extraMaterial') },
        { value: 'ledMaterial', label: tMessages('Manufacturers.PriceEngine.ledMaterial') },
    ]

    return (
        <div className="group p-4 bg-gradient-to-br from-violet-100 to-violet-200 rounded-lg shadow-md border border-violet-300 text-sm relative min-w-[180px]">
            <DeleteButton onClick={() => data.deleteNode(id)}/>
            
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <Handle 
                    type="source" 
                    position={Position.Right}
                    className="w-3 h-3 bg-violet-600 border-2 border-white"
                />
                <div className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-violet-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {tMessages('Manufacturers.PriceEngine.nodeOutput')}
                </div>
            </div>
            
            <div className="font-bold text-center text-violet-800 mb-3">
                <div className="text-lg">📦</div>
                <div className="text-xs">
                    {tMessages('Manufacturers.PriceEngine.variableMaterialValue')}
                </div>
            </div>
            
            <div className="space-y-2">
                <Select
                    value={valueType}
                    onValueChange={(value) => {
                        data.onChange(id, { valueType: value, materialVariable: materialVariable })
                    }}
                >
                    <SelectTrigger className="w-full bg-white/80 border-violet-300 hover:bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="id">{tMessages('Manufacturers.PriceEngine.id')}</SelectItem>
                        <SelectItem value="price">{tMessages('Manufacturers.PriceEngine.price')}</SelectItem>
                        <SelectItem value="weight">{tMessages('Manufacturers.PriceEngine.weight')}</SelectItem>
                        <SelectItem value="consumption">{tMessages('Manufacturers.PriceEngine.consumption')}</SelectItem>
                    </SelectContent>
                </Select>
                
                <Select
                    value={materialVariable}
                    onValueChange={(value) => {
                        data.onChange(id, { valueType: valueType, materialVariable: value })
                    }}
                >
                    <SelectTrigger className="w-full bg-white/80 border-violet-300 hover:bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {materialVariableOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
})

const OperatorNode = memo(({id, data}: NodeProps<any>) => {
    const tMessages = useTranslations()
    const connections = useNodeConnections({handleType: 'target'})

    return (
        <div className="group p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg shadow-md border border-yellow-300 text-sm relative min-w-[120px]">
        <DeleteButton onClick={() => data.deleteNode(id)}/>
            
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                <Handle 
                    type="target" 
                    position={Position.Left} 
                    isConnectable={connections?.length < 2}
                    className="w-3 h-3 bg-yellow-600 border-2 border-white"
                />
                <div className="absolute left-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-yellow-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {tMessages('Manufacturers.PriceEngine.nodeInput')}
    </div>
            </div>
            
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <Handle 
                    type="source" 
                    position={Position.Right}
                    className="w-3 h-3 bg-yellow-600 border-2 border-white"
                />
                <div className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-yellow-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {tMessages('Manufacturers.PriceEngine.nodeOutput')}
                </div>
            </div>
            
            <div className="text-center">
                <div className="text-2xl font-bold text-yellow-800 mb-1">
                    {data.operator}
                </div>
                <div className="text-xs text-yellow-600">
                    Operator
                </div>
            </div>
        </div>
    )
})

const LogicNode = memo(({id, data}: NodeProps<any>) => {
    const tMessages = useTranslations()
    const connections = useNodeConnections({handleType: 'target'})

    return (
        <div className="group p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg shadow-md border border-orange-300 text-sm relative min-w-[120px]">
        <DeleteButton onClick={() => data.deleteNode(id)}/>
            
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                <Handle 
                    type="target" 
                    position={Position.Left} 
                    isConnectable={connections?.length < 2}
                    className="w-3 h-3 bg-orange-600 border-2 border-white"
                />
                <div className="absolute left-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-orange-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {tMessages('Manufacturers.PriceEngine.nodeInput')}
    </div>
            </div>
            
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <Handle 
                    type="source" 
                    position={Position.Right}
                    className="w-3 h-3 bg-orange-600 border-2 border-white"
                />
                <div className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-orange-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {tMessages('Manufacturers.PriceEngine.nodeOutput')}
                </div>
            </div>
            
            <div className="text-center">
                <div className="text-lg font-bold text-orange-800 mb-1">
                    {data.operator}
                </div>
                <div className="text-xs text-orange-600">
                    Logic
                </div>
            </div>
        </div>
    )
})

const ComparisonNode = memo(({id, data}: NodeProps<any>) => {
    const tMessages = useTranslations()
    return (
    <div className="group p-4 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg shadow-md border border-teal-300 text-sm relative min-w-[120px]">
        <DeleteButton onClick={() => data.deleteNode(id)}/>
        
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <Handle 
                type="target" 
                position={Position.Left}
                className="w-3 h-3 bg-teal-600 border-2 border-white"
            />
            <div className="absolute left-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-teal-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {tMessages('Manufacturers.PriceEngine.nodeInput')}
    </div>
        </div>
        
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <Handle 
                type="source" 
                position={Position.Right}
                className="w-3 h-3 bg-teal-600 border-2 border-white"
            />
            <div className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-teal-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {tMessages('Manufacturers.PriceEngine.nodeOutput')}
            </div>
        </div>
        
        <div className="text-center">
            <div className="text-lg font-bold text-teal-800 mb-1">
                {data.operator}
            </div>
            <div className="text-xs text-teal-600">
                Compare
            </div>
        </div>
    </div>
    )
})

const CommentNode = memo(({id, data}: NodeProps<any>) => {
    const tMessages = useTranslations()
    return (
        <div className="group p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg shadow-md border border-slate-300 text-sm relative min-w-[200px] max-w-[260px]">
        <DeleteButton onClick={() => data.deleteNode(id)}/>

            <div className="font-bold text-slate-800 mb-2 flex items-center gap-1">
                <span>📝</span>
                <span>{tMessages('Manufacturers.PriceEngine.comment')}</span>
    </div>

            <textarea
                defaultValue={data.text || ''}
                onChange={(e) => data.onChange(id, { text: e.target.value })}
                placeholder="Add a note..."
                className="w-full h-[80px] resize-none rounded border border-slate-300 focus:border-slate-500 focus:outline-none p-2 text-xs bg-white/80"
            />
        </div>
    )
})

const SectionNode = memo(({ id, data }: NodeProps<any>) => {
    const tMessages = useTranslations()
    const title = data.title || tMessages('Manufacturers.PriceEngine.section')
    const color = data.color || '#94a3b8' // slate-400 default
    const isLocked = data.isLocked || false
    
    const handleColorChange = (newColor: string) => {
        if (data.onChange && typeof data.onChange === 'function') {
            data.onChange(id, { color: newColor })
        }
    }
    
    const toggleLock = () => {
        if (data.onChange && typeof data.onChange === 'function') {
            data.onChange(id, { isLocked: !isLocked })
        }
    }
    
    
    return (
        <div className="group relative w-full h-full pointer-events-auto">
            <NodeResizer 
                minWidth={200} 
                minHeight={200} 
                isVisible={!isLocked}
                keepAspectRatio={false}
            />
            <div
                className={cn(
                    "rounded-lg border shadow-sm w-full h-full",
                    isLocked && "opacity-75"
                )}
                style={{
                    borderColor: color,
                    background: `${color}20` // 20% opacity
                }}
            >
                <div className="flex items-center justify-between px-3 py-2">
                    <input
                        defaultValue={title}
                        onChange={(e) => {
                            if (data.onChange && typeof data.onChange === 'function') {
                                data.onChange(id, { title: e.target.value })
                            }
                        }}
                        className="text-lg font-semibold bg-transparent outline-none"
                        style={{ color: color }}
                    />
                    <button
                        className="text-xs text-red-600"
                        onClick={(e) => {
                            e.stopPropagation()
                            data.deleteNode(id)
                        }}
                    >
                        ×
                    </button>
                </div>
                
                {/* Color picker and lock button in bottom left corner */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className="w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title="Change color"
                            >
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" side="top" align="start">
                            <ColorPicker 
                                defaultValue={color} 
                                onChange={handleColorChange}
                            />
                        </PopoverContent>
                    </Popover>
                    
                    <button
                        onClick={toggleLock}
                        className={cn(
                            "w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform flex items-center justify-center",
                            isLocked ? "bg-red-500" : "bg-gray-500"
                        )}
                        title={isLocked ? "Unlock section" : "Lock section"}
                    >
                        {isLocked ? (
                            <Lock className="w-3 h-3 text-white" />
                        ) : (
                            <Unlock className="w-3 h-3 text-white" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
})

const ConditionalNode = memo(({id, data}: NodeProps<any>) => {
    const tMessages = useTranslations()
    return (
    <div className="group p-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg shadow-md border border-pink-300 text-sm relative min-w-[140px]">
        <DeleteButton onClick={() => data.deleteNode(id)}/>
        
        {/* Condition handle */}
        <div className="group absolute left-0 top-1/2">
            <Handle 
                type="target" 
                id="condition" 
                position={Position.Left}
                className="w-3 h-3 bg-pink-600 border-2 border-white"
            />
            <div className="absolute left-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-pink-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {tMessages('Manufacturers.PriceEngine.nodeCondition')}
            </div>
        </div>
        
        {/* True handle */}
        <div className="group absolute top-0 left-1/2 transform -translate-x-1/2">
            <Handle 
                type="target" 
                id="true" 
                position={Position.Top}
                className="w-3 h-3 bg-green-500 border-2 border-white"
            />
            <div className="absolute top-[-35px] left-1/2 transform -translate-x-1/2 text-xs bg-green-500 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {tMessages('Manufacturers.PriceEngine.nodeTrue')}
            </div>
        </div>
        
        {/* False handle */}
        <div className="group absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <Handle 
                type="target" 
                id="false" 
                position={Position.Bottom}
                className="w-3 h-3 bg-red-500 border-2 border-white"
            />
            <div className="absolute bottom-[-35px] left-1/2 transform -translate-x-1/2 text-xs bg-red-500 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {tMessages('Manufacturers.PriceEngine.nodeFalse')}
            </div>
        </div>
        
        {/* Output handle */}
        <div className="group absolute right-0 top-1/2 transform -translate-y-1/2">
            <Handle 
                type="source" 
                position={Position.Right}
                className="w-3 h-3 bg-purple-600 border-2 border-white"
            />
            <div className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-purple-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {tMessages('Manufacturers.PriceEngine.nodeOutput')}
            </div>
        </div>
        
        <div className="font-bold text-center text-pink-800">
            <div className="text-lg">🧠</div>
            <div>{tMessages('Manufacturers.PriceEngine.ifStatement')}</div>
        </div>
        <div className="text-xs mt-2 text-center text-pink-600 bg-white/50 rounded px-2 py-1">
            if (condition) ? true : false
        </div>
    </div>
    )
})

const SwitchNode = memo(({id, data}: NodeProps<any>) => {
    const tMessages = useTranslations()
    const [isExpanded, setIsExpanded] = useState(false)
    
    // Initialize cases if not present
    const cases = data.cases || [{ value: 0, id: 'case-0' }]
    
    const addCase = () => {
        const newCaseId = `case-${Date.now()}`
        const newCase = { value: cases.length, id: newCaseId }
        data.onChange(id, { cases: [...cases, newCase] })
    }
    
    const removeCase = (caseId: string) => {
        if (cases.length > 1) {
            data.onChange(id, { cases: cases.filter((c: any) => c.id !== caseId) })
        }
    }
    
    const updateCaseValue = (caseId: string, value: number) => {
        data.onChange(id, { 
            cases: cases.map((c: any) => 
                c.id === caseId ? { ...c, value } : c
            )
        })
    }
    
    return (
        <div className="group p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg shadow-md border border-indigo-300 text-sm relative min-w-[180px]">
            <DeleteButton onClick={() => data.deleteNode(id)}/>
            
            {/* Input handle for the switch value */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <Handle 
                    type="target" 
                    id="input" 
                    position={Position.Top}
                    className="w-3 h-3 bg-indigo-600 border-2 border-white"
                />
                <div className="absolute top-[-35px] left-1/2 transform -translate-x-1/2 text-xs bg-indigo-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {tMessages('Manufacturers.PriceEngine.switchInput')}
                </div>
            </div>
            
            {/* Case handles */}
            {cases.map((caseItem: any, index: number) => (
                <div key={caseItem.id} className="group absolute left-0" style={{ top: `${30 + (index * 25)}px` }}>
                    <Handle
                        type="target"
                        id={caseItem.id}
                        position={Position.Left}
                        className="w-3 h-3 bg-green-500 border-2 border-white"
                    />
                    <div 
                        className="absolute text-xs bg-green-500 text-white px-1 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                        style={{ 
                            left: '-40px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}
                    >
                        {caseItem.value}
                    </div>
                </div>
            ))}
            
            {/* Default case handle */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <Handle
                    type="target"
                    id="default"
                    position={Position.Bottom}
                    className="w-3 h-3 bg-gray-500 border-2 border-white"
                />
                <div className="absolute bottom-[-35px] left-1/2 transform -translate-x-1/2 text-xs bg-gray-500 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {tMessages('Manufacturers.PriceEngine.switchDefault')}
                </div>
            </div>
            
            {/* Output handle */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <Handle 
                    type="source" 
                    position={Position.Right}
                    className="w-3 h-3 bg-purple-600 border-2 border-white"
                />
                <div className="absolute right-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-purple-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {tMessages('Manufacturers.PriceEngine.switchOutput')}
                </div>
            </div>
            
            <div className="font-bold text-center mb-3 text-indigo-800">
                <div className="text-lg">🔄</div>
                <div>{tMessages('Manufacturers.PriceEngine.switch')}</div>
            </div>
            
            {/* Expandable configuration */}
            <div className="text-xs">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                >
                    {isExpanded ? tMessages('Manufacturers.PriceEngine.switchHideCases') : tMessages('Manufacturers.PriceEngine.switchShowCases')}
                </button>
                
                {isExpanded && (
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto bg-white/50 rounded p-2">
                        {cases.map((caseItem: any) => (
                            <div key={caseItem.id} className="flex items-center gap-2">
                                <label className="text-xs font-medium text-indigo-700 w-8">
                                    {tMessages('Manufacturers.PriceEngine.switchCase')}
                                </label>
                                <input
                                    type="number"
                                    value={caseItem.value}
                                    onChange={(e) => updateCaseValue(caseItem.id, parseInt(e.target.value) || 0)}
                                    className="flex-1 px-2 py-1 text-xs rounded border border-indigo-200 focus:border-indigo-400 focus:outline-none"
                                    placeholder="0"
                                />
                                <button
                                    onClick={() => removeCase(caseItem.id)}
                                    disabled={cases.length === 1}
                                    className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                                    title={tMessages('Manufacturers.PriceEngine.removeCase')}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addCase}
                            className="w-full text-xs bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 transition-colors font-medium"
                        >
                            {tMessages('Manufacturers.PriceEngine.switchAddCase')}
                        </button>
                    </div>
                )}
            </div>
            
            <div className="text-xs text-center mt-2 text-indigo-600">
                <div className="font-medium">{cases.length} {tMessages('Manufacturers.PriceEngine.switchCases')}</div>
                <div className="text-indigo-500">{tMessages('Manufacturers.PriceEngine.switchDefaultLabel')}</div>
            </div>
        </div>
    )
})

const OutputNode = memo(() => {
    const connections = useNodeConnections({handleType: 'target'})
    return (
        <div className="group p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg shadow-md border border-purple-300 text-center text-sm relative min-w-[120px]">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={connections?.length === 0}
                    className="w-3 h-3 bg-purple-600 border-2 border-white"
                />
                <div className="absolute left-[-70px] top-1/2 transform -translate-y-1/2 text-xs bg-purple-600 text-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Input
                </div>
            </div>
            
            <div className="font-bold text-purple-800">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-lg">Output</div>
                <div className="text-xs text-purple-600 mt-1">
                    Final Result
                </div>
            </div>
        </div>
    )
})

export const nodeTypes = {
    variable: VariableNode,
    constant: ConstantNode,
    materialPrice: MaterialPriceNode,
    constantMaterialValue: ConstantMaterialValueNode,
    variableMaterialValue: VariableMaterialValueNode,
    operator: OperatorNode,
    output: OutputNode,
    conditional: ConditionalNode,
    logic: LogicNode,
    comparison: ComparisonNode,
    switch: SwitchNode,
    comment: CommentNode,
    section: SectionNode,
}

type FlowCanvasProps = {
    nodes: any[]
    edges: any[]
    onNodesChange: any
    onEdgesChange: any
    onEdgeClick: any
    onConnect: any
    addNode: (type: keyof typeof nodeTypes, data?: any, position?: { x: number, y: number }) => void
    setNodes: any
    updateNodeData: any
    deleteNode: any
}

const FlowCanvas = ({ nodes, edges, onNodesChange, onEdgesChange, onEdgeClick, onConnect, addNode, setNodes, updateNodeData, deleteNode }: FlowCanvasProps) => {
    const { screenToFlowPosition } = useReactFlow()

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        const raw = event.dataTransfer.getData('application/reactflow')
        if (!raw) return
        try {
            const payload = JSON.parse(raw)
            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
            
            // For section nodes, we need to handle the style separately
            if (payload.type === 'section' && payload.style) {
                const id = nanoid()
                const nodeData = {
                    ...payload.data,
                    onChange: updateNodeData,
                    deleteNode,
                    preview: '',
                }
                
                setNodes((nds: any[]) => [
                    ...nds,
                    {
                        id,
                        type: payload.type,
                        position,
                        data: nodeData,
                        zIndex: -1,
                        style: payload.style,
                        draggable: !(payload.data?.isLocked || false),
                        selectable: false,
                    },
                ])
            } else {
                addNode(payload.type as keyof typeof nodeTypes, payload.data, position)
            }
        } catch {}
    }, [screenToFlowPosition, addNode, setNodes, updateNodeData, deleteNode])

    return (
        <ReactFlow
            className={'border rounded'}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeClick={onEdgeClick}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            maxZoom={2}
            minZoom={0.1}
            //@ts-ignore
            nodeTypes={nodeTypes}
        >
            <Background/>
            <Controls/>
        </ReactFlow>
    )
}

const DEFAULT_OUTPUT_NODE = () => [{
    id: 'output',
    type: 'output',
    position: { x: 600, y: 300 },
    data: {},
    deletable: false
}]

type FormulaTab = 'price' | 'mounting' | 'extras'

export const ProductPricingConfigurator = ({ product, materials }: { product: Product; materials: Material[] }) => {
    const { data: session } = useSession()
    const { toast } = useToast()
    const tMessages = useTranslations('')

    const [activeTab, setActiveTab] = useState<FormulaTab>('price')

    const [priceNodes, setPriceNodes, onPriceNodesChange] = useNodesState(product.priceConfiguration?.nodes ?? [])
    const [priceEdges, setPriceEdges, onPriceEdgesChange] = useEdgesState(product.priceConfiguration?.edges ?? [])
    const [priceFormula, setPriceFormula] = useState(product.priceFormula ?? '')

    const [mountingNodes, setMountingNodes, onMountingNodesChange] = useNodesState(product.mountingConfiguration?.nodes ?? [])
    const [mountingEdges, setMountingEdges, onMountingEdgesChange] = useEdgesState(product.mountingConfiguration?.edges ?? [])
    const [mountingFormula, setMountingFormula] = useState(product.mountingFormula ?? '')

    const [extrasNodes, setExtrasNodes, onExtrasNodesChange] = useNodesState(product.extrasConfiguration?.nodes ?? [])
    const [extrasEdges, setExtrasEdges, onExtrasEdgesChange] = useEdgesState(product.extrasConfiguration?.edges ?? [])
    const [extrasFormula, setExtrasFormula] = useState(product.extrasFormula ?? '')

    const deleteNodePrice = useCallback((id: string) => {
        setPriceNodes((nds) => nds.filter((n) => n.id !== id))
        setPriceEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    }, [setPriceNodes, setPriceEdges])
    const deleteNodeMounting = useCallback((id: string) => {
        setMountingNodes((nds) => nds.filter((n) => n.id !== id))
        setMountingEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    }, [setMountingNodes, setMountingEdges])
    const deleteNodeExtras = useCallback((id: string) => {
        setExtrasNodes((nds) => nds.filter((n) => n.id !== id))
        setExtrasEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    }, [setExtrasNodes, setExtrasEdges])

    const updateNodeDataPrice = useCallback((id: string, patch: any) => {
        setPriceNodes((nds) =>
            nds.map((n) => {
                if (n.id !== id) return n
                const isObjectPatch = patch !== null && typeof patch === 'object'
                const updatedData = { ...n.data, ...(isObjectPatch ? patch : { value: patch }) }
                const updatedNode = { ...n, data: updatedData }
                if (n.type === 'section' && isObjectPatch && 'isLocked' in patch) updatedNode.draggable = !patch.isLocked
                return updatedNode
            })
        )
    }, [setPriceNodes])
    const updateNodeDataMounting = useCallback((id: string, patch: any) => {
        setMountingNodes((nds) =>
            nds.map((n) => {
                if (n.id !== id) return n
                const isObjectPatch = patch !== null && typeof patch === 'object'
                const updatedData = { ...n.data, ...(isObjectPatch ? patch : { value: patch }) }
                const updatedNode = { ...n, data: updatedData }
                if (n.type === 'section' && isObjectPatch && 'isLocked' in patch) updatedNode.draggable = !patch.isLocked
                return updatedNode
            })
        )
    }, [setMountingNodes])
    const updateNodeDataExtras = useCallback((id: string, patch: any) => {
        setExtrasNodes((nds) =>
            nds.map((n) => {
                if (n.id !== id) return n
                const isObjectPatch = patch !== null && typeof patch === 'object'
                const updatedData = { ...n.data, ...(isObjectPatch ? patch : { value: patch }) }
                const updatedNode = { ...n, data: updatedData }
                if (n.type === 'section' && isObjectPatch && 'isLocked' in patch) updatedNode.draggable = !patch.isLocked
                return updatedNode
            })
        )
    }, [setExtrasNodes])

    const injectNodeData = useCallback((node: any, updateNodeData: (id: string, patch: any) => void, deleteNode: (id: string) => void) => ({
        ...node,
        zIndex: node.type === 'section' ? -1 : node.zIndex,
        selectable: node.type === 'section' ? false : node.selectable,
        data: {
            ...node.data,
            materials: (node.type === 'materialPrice' || node.type === 'constantMaterialValue') ? materials : undefined,
            onChange: updateNodeData,
            deleteNode,
            cases: node.type === 'switch' && !node.data.cases ? [{ value: 0, id: `case-${Date.now()}` }] : node.data.cases
        }
    }), [materials])

    useEffect(() => {
        if (product.priceConfiguration?.nodes?.length) {
            setPriceNodes(product.priceConfiguration.nodes.map((n: any) => injectNodeData(n, updateNodeDataPrice, deleteNodePrice)))
            setPriceEdges(product.priceConfiguration.edges ?? [])
        } else {
            setPriceNodes(DEFAULT_OUTPUT_NODE().map((n: any) => injectNodeData(n, updateNodeDataPrice, deleteNodePrice)))
            setPriceEdges([])
        }
        setPriceFormula(product.priceFormula ?? '')

        const mountingConfig = product.mountingConfiguration
        if (mountingConfig && Array.isArray(mountingConfig.nodes)) {
            if (mountingConfig.nodes.length > 0) {
                setMountingNodes(mountingConfig.nodes.map((n: any) => injectNodeData(n, updateNodeDataMounting, deleteNodeMounting)))
            } else {
                setMountingNodes(DEFAULT_OUTPUT_NODE().map((n: any) => injectNodeData(n, updateNodeDataMounting, deleteNodeMounting)))
            }
            setMountingEdges(mountingConfig.edges ?? [])
        } else {
            setMountingNodes(DEFAULT_OUTPUT_NODE().map((n: any) => injectNodeData(n, updateNodeDataMounting, deleteNodeMounting)))
            setMountingEdges([])
        }
        setMountingFormula(product.mountingFormula ?? '')

        const extrasConfig = product.extrasConfiguration
        if (extrasConfig && Array.isArray(extrasConfig.nodes)) {
            if (extrasConfig.nodes.length > 0) {
                setExtrasNodes(extrasConfig.nodes.map((n: any) => injectNodeData(n, updateNodeDataExtras, deleteNodeExtras)))
            } else {
                setExtrasNodes(DEFAULT_OUTPUT_NODE().map((n: any) => injectNodeData(n, updateNodeDataExtras, deleteNodeExtras)))
            }
            setExtrasEdges(extrasConfig.edges ?? [])
        } else {
            setExtrasNodes(DEFAULT_OUTPUT_NODE().map((n: any) => injectNodeData(n, updateNodeDataExtras, deleteNodeExtras)))
            setExtrasEdges([])
        }
        setExtrasFormula(product.extrasFormula ?? '')
    }, [])

    const currentNodes = activeTab === 'price' ? priceNodes : activeTab === 'mounting' ? mountingNodes : extrasNodes
    const currentEdges = activeTab === 'price' ? priceEdges : activeTab === 'mounting' ? mountingEdges : extrasEdges
    const currentSetNodes = activeTab === 'price' ? setPriceNodes : activeTab === 'mounting' ? setMountingNodes : setExtrasNodes
    const currentSetEdges = activeTab === 'price' ? setPriceEdges : activeTab === 'mounting' ? setMountingEdges : setExtrasEdges
    const currentOnNodesChange = activeTab === 'price' ? onPriceNodesChange : activeTab === 'mounting' ? onMountingNodesChange : onExtrasNodesChange
    const currentOnEdgesChange = activeTab === 'price' ? onPriceEdgesChange : activeTab === 'mounting' ? onMountingEdgesChange : onExtrasEdgesChange
    const currentDeleteNode = activeTab === 'price' ? deleteNodePrice : activeTab === 'mounting' ? deleteNodeMounting : deleteNodeExtras
    const currentUpdateNodeData = activeTab === 'price' ? updateNodeDataPrice : activeTab === 'mounting' ? updateNodeDataMounting : updateNodeDataExtras
    const currentFormula = activeTab === 'price' ? priceFormula : activeTab === 'mounting' ? mountingFormula : extrasFormula

    const addNode = useCallback((type: keyof typeof nodeTypes, data?: any, position?: { x: number; y: number }) => {
        const id = nanoid()
        const nodeData = type === 'switch'
            ? { ...data, cases: [{ value: 0, id: `case-${Date.now()}` }], onChange: currentUpdateNodeData, deleteNode: currentDeleteNode, preview: '' }
            : { ...data, onChange: currentUpdateNodeData, deleteNode: currentDeleteNode, preview: '' }
        currentSetNodes((nds: any[]) => [
            ...nds,
            {
                id,
                type,
                position: position ?? { x: Math.random() * 400, y: Math.random() * 400 },
                data: nodeData,
                zIndex: type === 'section' ? -1 : undefined,
                style: type === 'section' ? { width: 300, height: 200 } : undefined,
                draggable: type === 'section' ? !(data?.isLocked || false) : true,
                selectable: type === 'section' ? false : undefined
            }
        ])
    }, [currentSetNodes, currentUpdateNodeData, currentDeleteNode])


    function buildFormulaFromNodes(nodes: any[], edges: Edge[], id: string): string {
        const node = nodes.find((n: any) => n.id === id)
        if (!node) return '?'
        if (node.type === 'constant') return node.data.value.toString()
        if (node.type === 'materialPrice') return node.data?.value ?? '?'
        if (node.type === 'constantMaterialValue') {
            const valueType = node.data?.valueType || 'id'
            const materialId = node.data?.materialId
            if (!materialId) return '?'
            if (valueType === 'id') return `"${materialId}"`
            return `${valueType}["${materialId}"]`
        }
        if (node.type === 'variableMaterialValue') {
            const valueType = node.data?.valueType || 'price'
            const materialVariable = node.data?.materialVariable
            if (!materialVariable) return '?'
            return `${valueType}["${materialVariable}"]`
        }
        if (node.type === 'variable') return node.data.value
        if (['operator', 'logic', 'comparison'].includes(node.type)) {
            const inputs = edges.filter((e) => e.target === id).map((e) => e.source)
            if (inputs.length !== 2) return '?'
            const [left, right] = inputs.map((sid) => buildFormulaFromNodes(nodes, edges, sid))
            return `(${left} ${node.data.operator} ${right})`
        }
        if (node.type === 'conditional') {
            const getInput = (handleId: string) => edges.find((e) => e.target === id && e.targetHandle === handleId)?.source
            const cond = getInput('condition'), valTrue = getInput('true'), valFalse = getInput('false')
            if (!cond || !valTrue || !valFalse) return '?'
            return `(${buildFormulaFromNodes(nodes, edges, cond)} ? ${buildFormulaFromNodes(nodes, edges, valTrue)} : ${buildFormulaFromNodes(nodes, edges, valFalse)})`
        }
        if (node.type === 'switch') {
            const getInput = (handleId: string) => edges.find((e) => e.target === id && e.targetHandle === handleId)?.source
            const inputValue = getInput('input')
            if (!inputValue) return '?'
            const configuredCases = node.data.cases || []
            const cases: { [key: number]: string } = {}
            configuredCases.forEach((caseItem: any) => {
                const caseInput = getInput(caseItem.id)
                if (caseInput) cases[caseItem.value] = buildFormulaFromNodes(nodes, edges, caseInput)
            })
            const defaultInput = getInput('default')
            const defaultCase = defaultInput ? buildFormulaFromNodes(nodes, edges, defaultInput) : '0'
            if (Object.keys(cases).length === 0) return defaultCase
            const sortedCases = Object.entries(cases).sort(([a], [b]) => parseInt(a) - parseInt(b))
            let switchExpression = defaultCase
            for (let i = sortedCases.length - 1; i >= 0; i--) {
                const [caseValue, caseFormula] = sortedCases[i]
                switchExpression = `(${buildFormulaFromNodes(nodes, edges, inputValue)} == ${caseValue} ? ${caseFormula} : ${switchExpression})`
            }
            return switchExpression
        }
        return '?'
    }

    useEffect(() => {
        const outputEdge = priceEdges.find((e) => e.target === 'output')
        if (!outputEdge) return
        const formulaStr = buildFormulaFromNodes(priceNodes, priceEdges, outputEdge.source)
        if (formulaStr !== priceFormula) setPriceFormula(formulaStr)
    }, [priceNodes, priceEdges])
    useEffect(() => {
        const outputEdge = mountingEdges.find((e) => e.target === 'output')
        if (!outputEdge) return
        const formulaStr = buildFormulaFromNodes(mountingNodes, mountingEdges, outputEdge.source)
        if (formulaStr !== mountingFormula) setMountingFormula(formulaStr)
    }, [mountingNodes, mountingEdges])
    useEffect(() => {
        const outputEdge = extrasEdges.find((e) => e.target === 'output')
        if (!outputEdge) return
        const formulaStr = buildFormulaFromNodes(extrasNodes, extrasEdges, outputEdge.source)
        if (formulaStr !== extrasFormula) setExtrasFormula(formulaStr)
    }, [extrasNodes, extrasEdges])

    const cleanNodes = (nodes: any[]) => nodes.map(({ data, ...rest }) => ({
        ...rest,
        data: { ...data, onChange: undefined, deleteNode: undefined, materials: undefined }
    }))

    const saveFormula = async () => {
        try {
            const response = await submitData(
                `${routes.priceEngine}/${product.id}`,
                (session as any).accessToken,
                {
                    id: product.id,
                    priceFormula: priceFormula,
                    priceConfiguration: { nodes: cleanNodes(priceNodes), edges: priceEdges },
                    mountingFormula: mountingFormula ?? '',
                    mountingConfiguration: { nodes: cleanNodes(mountingNodes), edges: mountingEdges },
                    extrasFormula: extrasFormula ?? '',
                    extrasConfiguration: { nodes: cleanNodes(extrasNodes), edges: extrasEdges }
                },
            );
            if (response.error) {
                toast({
                    variant: "destructive",
                    title: tMessages('Messages.genericError'),
                    description: response.error.message,
                });
            } else {
                toast({
                    title: tMessages('Messages.success'),
                    description: tMessages('Manufacturers.PriceEngine.priceUpdated'),
                });
            }
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: tMessages('Messages.genericError'),
                description: e.message,
            });
        }
    }

    const valueNodes = useMemo(() => {
        const values = [
            {
                label: tMessages(`Manufacturers.PriceEngine.graphicArea`),
                value: 'graphicArea',
                hint: tMessages(`Manufacturers.PriceEngine.graphicAreaHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.cutPerimeter`),
                value: 'cutPerimeter',
                hint: tMessages(`Manufacturers.PriceEngine.cutPerimeterHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.plexiNestingResult`),
                value: 'plexiNestingResult',
                hint: tMessages(`Manufacturers.PriceEngine.plexiNestingResultHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.bondNestingResult`),
                value: 'bondNestingResult',
                hint: tMessages(`Manufacturers.PriceEngine.bondNestingResultHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.oracalNestingResult`),
                value: 'oracalNestingResult',
                hint: tMessages(`Manufacturers.PriceEngine.oracalNestingResultHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.letterHeight`),
                value: 'letterHeight',
                hint: tMessages(`Manufacturers.PriceEngine.letterHeightHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.letterWidth`),
                value: 'letterWidth',
                hint: tMessages(`Manufacturers.PriceEngine.letterWidthHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.letterDepth`),
                value: 'letterDepth',
                hint: tMessages(`Manufacturers.PriceEngine.letterDepthHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.faceMaterial`),
                value: 'faceMaterial',
                hint: tMessages(`Manufacturers.PriceEngine.faceMaterialHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.sideMaterial`),
                value: 'sideMaterial',
                hint: tMessages(`Manufacturers.PriceEngine.sideMaterialHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.extraMaterial`),
                value: 'extraMaterial',
                hint: tMessages(`Manufacturers.PriceEngine.extraMaterialHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.ledMaterial`),
                value: 'ledMaterial',
                hint: tMessages(`Manufacturers.PriceEngine.ledMaterialHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.mounting`),
                value: 'mounting',
                hint: tMessages(`Manufacturers.PriceEngine.mountingHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.mountingWidth`),
                value: 'mountingWidth',
                hint: tMessages(`Manufacturers.PriceEngine.mountingWidthHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.mountingHeight`),
                value: 'mountingHeight',
                hint: tMessages(`Manufacturers.PriceEngine.mountingHeightHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.mountingPadding`),
                value: 'mountingPadding',
                hint: tMessages(`Manufacturers.PriceEngine.mountingPaddingHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.isExterior`),
                value: 'isExterior',
                hint: tMessages(`Manufacturers.PriceEngine.isExteriorHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.withLightSensor`),
                value: 'withLightSensor',
                hint: tMessages(`Manufacturers.PriceEngine.withLightSensorHint`)
            },
            {
                label: tMessages(`Manufacturers.PriceEngine.cableLength`),
                value: 'cableLength',
                hint: tMessages(`Manufacturers.PriceEngine.cableLengthHint`)
            },
        ]

        switch (product.type) {
            case ProductType.volumetricClassic:
            case ProductType.volumetricHalo:
            case ProductType.volumetricSlim:
            case ProductType.neonLed:
                return [
                    ...values
                ]
            case ProductType.boxOneFace:
            case ProductType.boxTwoFaces:
            case ProductType.boxBond:
            case ProductType.boxCanvas:
                return [
                    {label: 'Box Width', value: 'boxWidth', hint: 'The width of the box.'},
                    {label: 'Box Height', value: 'boxHeight', hint: 'The height of the box.'},
                    {label: 'Box Depth', value: 'boxDepth', hint: 'The depth of the box.'},
                    ...values,
                ]

            default:
                return []
        }
    }, [product.type])

    const renderedFormula = useMemo(() => {
        if (!currentFormula) return null;

        const variableLabelMap = Object.fromEntries(
            valueNodes.map(({ value, label }) => [value, label])
        );

        const materialMap = Object.fromEntries(
            materials.map((m) => [m.id, m.productAlias])
        );

        // First, replace material value patterns (price[materialId], weight[materialId], consumption[materialId])
        // with placeholders to preserve them during tokenization
        const materialValuePattern = /(id|price|weight|consumption)\[([^\]]+)]/g
        const placeholders: string[] = []
        let placeholderIndex = 0
        let formulaWithPlaceholders = currentFormula.replace(materialValuePattern, (match, valueType, materialId) => {
            const placeholder = `__MATERIAL_VALUE_${placeholderIndex}__`
            placeholders[placeholderIndex] = JSON.stringify({ valueType, materialId })
            placeholderIndex++
            return placeholder
        })

        // Replace quoted material IDs ("MB0000001") with placeholders so they render as plain strings
        const quotedIdPattern = /"(MB\d{7})"/g
        const quotedIdPlaceholders: string[] = []
        let quotedIdIndex = 0
        formulaWithPlaceholders = formulaWithPlaceholders.replace(quotedIdPattern, (match, materialId) => {
            const placeholder = `__QUOTED_ID_${quotedIdIndex}__`
            quotedIdPlaceholders[quotedIdIndex] = materialId
            quotedIdIndex++
            return placeholder
        })

        const tokens = formulaWithPlaceholders.split(/(\W+)/); // includes punctuation and operators

        return (
            <div className="flex flex-wrap gap-[2px] items-center p-2 bg-muted rounded text-sm leading-relaxed">
                {tokens.map((token, idx) => {
                    const trimmed = token.trim();

                    // Quoted material ID – show as plain string (e.g. "MB0000001")
                    const quotedIdMatch = trimmed.match(/^__QUOTED_ID_(\d+)__$/)
                    if (quotedIdMatch) {
                        const id = quotedIdPlaceholders[parseInt(quotedIdMatch[1])]
                        return (
                            <span key={idx} className="font-mono text-sm whitespace-pre">"{id}"</span>
                        )
                    }

                    // Material value placeholder (e.g., price[MB0000279], weight[MB0000279], consumption[MB0000279] or price[faceMaterial])
                    const placeholderMatch = trimmed.match(/^__MATERIAL_VALUE_(\d+)__$/)
                    if (placeholderMatch) {
                        const placeholderIdx = parseInt(placeholderMatch[1])
                        const { valueType, materialId } = JSON.parse(placeholders[placeholderIdx])
                        const valueTypeLabel = tMessages(`Manufacturers.PriceEngine.${valueType}`)
                        
                        // Check if it's a material ID (starts with MB) or a variable name (like faceMaterial)
                        if (/^MB\d{7}$/.test(materialId)) {
                            // It's a constant material ID
                            const label = materialMap[materialId] ?? materialId
                            return (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs font-mono bg-white"
                                    title={`Material ${valueTypeLabel}: ${materialId}`}
                                >
                                    📦 {valueTypeLabel}[{label}]
                                </Badge>
                            );
                        } else {
                            // It's a variable material name (faceMaterial, sideMaterial, etc.)
                            const variableLabel = variableLabelMap[materialId] ?? materialId
                            return (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs font-mono bg-white"
                                    title={`Material ${valueTypeLabel}: ${materialId}`}
                                >
                                    📦 {valueTypeLabel}[{variableLabel}]
                                </Badge>
                            );
                        }
                    }

                    // Variable (e.g., nestingResult)
                    if (variableLabelMap[trimmed]) {
                        return (
                            <Badge
                                key={idx}
                                variant={'outline'}
                                className="text-xs font-medium bg-white"
                                title={trimmed}
                            >
                                🔣 {variableLabelMap[trimmed]}
                            </Badge>
                        );
                    }

                    // Material ID (e.g., MB0000279) - standalone material ID (from MaterialPriceNode)
                    if (/^MB\d{7}$/.test(trimmed)) {
                        const label = materialMap[trimmed] ?? trimmed;
                        return (
                            <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs font-mono bg-white"
                                title={`Material: ${trimmed}`}
                            >
                                🧱 {label}
                            </Badge>
                        );
                    }

                    // Default: operators, numbers, parens, whitespace, etc.
                    return (
                        <span key={idx} className="whitespace-pre">
                        {token}
                    </span>
                    );
                })}
            </div>
        );
    }, [currentFormula, valueNodes, materials, tMessages])

    const handleEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
        currentSetEdges((eds) => eds.filter((e: Edge) => e.id !== edge.id))
        const newEdges = currentEdges.filter((e: Edge) => e.id !== edge.id)
        const outputEdge = newEdges.find((e) => e.target === 'output')
        if (outputEdge) {
            const formulaStr = buildFormulaFromNodes(currentNodes, newEdges, outputEdge.source)
            const setFormula = activeTab === 'price' ? setPriceFormula : activeTab === 'mounting' ? setMountingFormula : setExtrasFormula
            setFormula(formulaStr)
        }
    }, [currentSetEdges, currentEdges, currentNodes, activeTab, setPriceFormula, setMountingFormula, setExtrasFormula])

    const handleConnect = useCallback((connection: Connection) => {
        currentSetEdges((eds) => addEdge({ ...connection, markerEnd: { type: MarkerType.ArrowClosed } }, eds))
    }, [currentSetEdges])

    return (
        <div className="w-full space-y-6">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">
                    <span className="font-semibold text-foreground">{product.name}</span>
                    <span className="mx-2">·</span>
                    <span>{product.type}</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{tMessages('Manufacturers.PriceEngine.description')}</p>
            </div>

            <div className="flex gap-1 rounded-lg border border-muted bg-muted/30 p-1">
                <button
                    type="button"
                    onClick={() => setActiveTab('price')}
                    className={cn(
                        'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                        activeTab === 'price' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                >
                    {tMessages('Manufacturers.PriceEngine.priceFormulaTab')}
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('mounting')}
                    className={cn(
                        'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                        activeTab === 'mounting' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                >
                    {tMessages('Manufacturers.PriceEngine.mountingFormulaTab')}
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('extras')}
                    className={cn(
                        'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                        activeTab === 'extras' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                >
                    {tMessages('Manufacturers.PriceEngine.extrasFormulaTab')}
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border bg-muted/20 shadow-sm">
                <div className="h-[600px]">
                    <ReactFlowProvider>
                        <FlowCanvas
                            nodes={currentNodes}
                            edges={currentEdges}
                            onNodesChange={currentOnNodesChange}
                            onEdgesChange={currentOnEdgesChange}
                            onEdgeClick={handleEdgeClick}
                            onConnect={handleConnect}
                            addNode={addNode}
                            setNodes={currentSetNodes}
                            updateNodeData={currentUpdateNodeData}
                            deleteNode={currentDeleteNode}
                        />
                    </ReactFlowProvider>
                </div>
            </div>

            {renderedFormula && (
                <div className="rounded-lg border bg-muted/30">
                    {renderedFormula}
                </div>
            )}

            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-3">
                        <Label className="text-sm font-semibold">{tMessages('Manufacturers.PriceEngine.operators')}</Label>
                        <div className="flex flex-wrap gap-2">
                        {['+', '-', '*', '/'].map((op) => (
                            <Button
                                key={op}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'operator', data: { operator: op } }))
                                    e.dataTransfer.effectAllowed = 'move'
                                }}
                                onClick={() => addNode('operator', {operator: op})}
                                className="bg-yellow-600 text-white px-3 py-1 rounded w-12"
                            >
                                {op}
                            </Button>
                        ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label className="text-sm font-semibold">{tMessages('Manufacturers.PriceEngine.logic')}</Label>
                        <div className="flex flex-wrap gap-2">
                        {['==', '>', '<'].map((op) => (
                            <Button
                                key={op}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'comparison', data: { operator: op } }))
                                    e.dataTransfer.effectAllowed = 'move'
                                }}
                                onClick={() => addNode('comparison', {operator: op})}
                                className="bg-teal-600 text-white px-3 py-1 rounded w-12"
                            >
                                {op}
                            </Button>
                        ))}
                        {['and', 'or'].map((op) => (
                            <Button
                                key={op}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'logic', data: { operator: op } }))
                                    e.dataTransfer.effectAllowed = 'move'
                                }}
                                onClick={() => addNode('logic', {operator: op})}
                                className="bg-orange-600 text-white px-3 py-1 rounded w-12"
                            >
                                {op}
                            </Button>
                        ))}
                        <Button
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'conditional', data: {} }))
                                e.dataTransfer.effectAllowed = 'move'
                            }}
                            onClick={() => addNode('conditional', {})}
                            className="bg-pink-600 text-white px-3 py-1 rounded w-24"
                        >
                            {tMessages('Manufacturers.PriceEngine.ifStatement')}
                        </Button>
                        <Button
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'switch', data: {} }))
                                e.dataTransfer.effectAllowed = 'move'
                            }}
                            onClick={() => addNode('switch', {})}
                            className="bg-indigo-600 text-white px-3 py-1 rounded w-20"
                        >
                            {tMessages('Manufacturers.PriceEngine.switch')}
                        </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label className="text-sm font-semibold">{tMessages('Manufacturers.PriceEngine.layoutAndNotes')}</Label>
                        <div className="flex flex-wrap gap-2">
                        <Button
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'section', data: { title: tMessages('Manufacturers.PriceEngine.section'), color: '#94a3b8' }, style: { zIndex: -1, width: 300, height: 200 } }))
                                e.dataTransfer.effectAllowed = 'move'
                            }}
                            onClick={() => addNode('section', { title: tMessages('Manufacturers.PriceEngine.section'), color: '#94a3b8' })}
                            className="bg-slate-500 text-white px-3 py-1 rounded w-24"
                        >
                            {tMessages('Manufacturers.PriceEngine.section')}
                        </Button>
                        <Button
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'comment', data: { text: '' } }))
                                e.dataTransfer.effectAllowed = 'move'
                            }}
                            onClick={() => addNode('comment', { text: '' })}
                            className="bg-slate-600 text-white px-3 py-1 rounded w-24"
                        >
                            {tMessages('Manufacturers.PriceEngine.comment')}
                        </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-4">
                        <Label className="text-sm font-semibold">{tMessages('Manufacturers.PriceEngine.values')}</Label>
                        <div className="flex flex-wrap gap-2">
                    {valueNodes.map((v) => (
                        <Tooltip key={v.value}>
                            <TooltipTrigger asChild>
                                <Button
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'variable', data: v }))
                                        e.dataTransfer.effectAllowed = 'move'
                                    }}
                                    onClick={() => addNode('variable', v)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded w-30"
                                >
                                    {v.label}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{v.hint}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'constant', data: { value: 0 } }))
                                    e.dataTransfer.effectAllowed = 'move'
                                }}
                                onClick={() => addNode('constant', {value: 0})}
                                className="bg-green-600 text-white px-3 py-1 rounded w-24"
                            >
                                {tMessages(`Manufacturers.PriceEngine.constant`)}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tMessages(`Manufacturers.PriceEngine.constantHint`)}</p>
                        </TooltipContent>
                    </Tooltip> <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'materialPrice', data: { materials } }))
                                e.dataTransfer.effectAllowed = 'move'
                            }}
                            onClick={() => addNode('materialPrice', {materials})}
                            className="bg-green-600 text-white px-3 py-1 rounded w-30"
                        >
                            {tMessages(`Manufacturers.PriceEngine.materialPrice`)}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tMessages(`Manufacturers.PriceEngine.materialPriceHint`)}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'constantMaterialValue', data: { materials, valueType: 'price', materialId: undefined } }))
                                e.dataTransfer.effectAllowed = 'move'
                            }}
                            onClick={() => addNode('constantMaterialValue', {materials, valueType: 'price', materialId: undefined})}
                            className="bg-cyan-600 text-white px-3 py-1 rounded w-30"
                        >
                            {tMessages('Manufacturers.PriceEngine.materialValue')}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tMessages('Manufacturers.PriceEngine.materialValueHint')}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'variableMaterialValue', data: { valueType: 'price', materialVariable: 'faceMaterial' } }))
                                e.dataTransfer.effectAllowed = 'move'
                            }}
                            onClick={() => addNode('variableMaterialValue', {valueType: 'price', materialVariable: 'faceMaterial'})}
                            className="bg-violet-600 text-white px-3 py-1 rounded w-30"
                        >
                            {tMessages('Manufacturers.PriceEngine.variableMaterialValue')}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tMessages('Manufacturers.PriceEngine.variableMaterialValueHint')}</p>
                    </TooltipContent>
                </Tooltip>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button onClick={saveFormula}>{tMessages('Misc.save')}</Button>
            </div>
        </div>
    )
}
