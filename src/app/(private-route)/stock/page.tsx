'use client'

import { TextField, Checkbox, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import styles from './styles.module.css';
import { useEffect, useState } from 'react';
import { AddCircleOutline } from '@mui/icons-material';
import { ButtonForm } from '@/components/ButtonForm';
import { ModalNewMarca } from '@/components/ModalNewMarca';

interface Produto {
    id: number;
    nome: string;
    marca: string;
    quantidade: number;
    editando: boolean;
}

export default function Stock() {
    const [newProduct, setNewProduct] = useState(true);
    const [openModal, setOpenModal] = useState(false);

    const [nome, setNome] = useState('');
    const [marca, setMarca] = useState('');
    const [quantidade, setQuantidade] = useState<number>(0);
    const [produtos, setProdutos] = useState<Produto[]>([]);

    const apiUrl = 'http://localhost:3001/produtos';

    // Buscar produtos ao carregar
    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                const res = await fetch(apiUrl);
                const data = await res.json();
                setProdutos(data.map((p: Produto) => ({ ...p, editando: false })));
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
            }
        };
        fetchProdutos();
    }, []);

    // Função chamada ao submeter o formulário
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSalvar();
    };

    // Criar novo produto
    const handleSalvar = async () => {
        const novoProduto = {
            nome,
            marca,
            quantidade
        };

        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoProduto)
            });

            const produtoSalvo = await res.json();
            setProdutos([...produtos, { ...produtoSalvo, editando: false }]);
            setNome('');
            setMarca('');
            setQuantidade(0);
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
        }
    };

    // Editar produto
    const handleEditar = (id: number) => {
        setProdutos(produtos.map(p => p.id === id ? { ...p, editando: true } : p));
    };

    // Salvar edição
    const handleSalvarEdicao = async (produto: Produto) => {
        try {
            const res = await fetch(`${apiUrl}/${produto.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: produto.nome,
                    marca: produto.marca,
                    quantidade: produto.quantidade
                })
            });

            if (res.ok) {
                setProdutos(produtos.map(p =>
                    p.id === produto.id ? { ...produto, editando: false } : p
                ));
            }
        } catch (error) {
            console.error('Erro ao salvar edição:', error);
        }
    };

    // Atualiza valores ao digitar na edição
    const handleChangeProduto = (id: number, campo: keyof Produto, valor: any) => {
        setProdutos(produtos.map(p =>
            p.id === id ? { ...p, [campo]: valor } : p
        ));
    };

    return (
        <div className={styles.container}>
            <ModalNewMarca open={openModal} handleClose={() => setOpenModal(!openModal)} />
            <h1>Estoque</h1>

            <div className={styles.content}>
                <h2>Entrada de produtos</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.selectRegister}>
                        <span>Produto Novo?</span>
                        <Checkbox checked={newProduct} onChange={(e) => setNewProduct(e.target.checked)} />
                    </div>

                    <div className={styles.formSeparetor}>
                        <TextField
                            label="Nome do Produto"
                            variant="outlined"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            sx={{ width: '30%' }}
                        />

                        <TextField
                            label="Marca"
                            variant="outlined"
                            value={marca}
                            onChange={(e) => setMarca(e.target.value)}
                            sx={{ width: '30%' }}
                        />

                        <TextField
                            label="Quantidade"
                            type="number"
                            variant="outlined"
                            value={quantidade}
                            onChange={(e) => setQuantidade(Number(e.target.value))}
                            sx={{ width: '20%' }}
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <ButtonForm text="Cadastrar" handle={handleSalvar} />
                    </div>
                </form>
            </div>

            <h1>Lista de Produtos</h1>
           
            <div className={styles.productList}>
                {produtos.map((produto) => (
                    <div key={produto.id} className={styles.productItem}>
                        {produto.editando ? (
                            <>
                                <TextField
                                    label="Nome"
                                    value={produto.nome}
                                    onChange={(e) => handleChangeProduto(produto.id, 'nome', e.target.value)}
                                    sx={{ marginRight: '1rem' }}
                                />
                                <TextField
                                    label="Marca"
                                    value={produto.marca}
                                    onChange={(e) => handleChangeProduto(produto.id, 'marca', e.target.value)}
                                    sx={{ marginRight: '1rem' }}
                                />
                                <TextField
                                    label="Quantidade"
                                    type="number"
                                    value={produto.quantidade}
                                    onChange={(e) => handleChangeProduto(produto.id, 'quantidade', Number(e.target.value))}
                                    sx={{ marginRight: '1rem' }}
                                />
                                <ButtonForm text="Salvar" handle={() => handleSalvarEdicao(produto)} />
                            </>
                        ) : (
                    
                                <div className={styles.li}>
                                    <p><strong>Nome:</strong> {produto.nome}</p>
                                    <p><strong>Marca:</strong> {produto.marca}</p>
                                    <p><strong>Quantidade:</strong> {produto.quantidade}</p>
                                    <ButtonForm text="Editar" handle={() => handleEditar(produto.id)} />
                                </div>
                        )}
                    </div>
                ))}
                </div>
            
        </div>
    )
}
