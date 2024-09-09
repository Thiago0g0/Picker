import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Picker, Pressable, Image } from 'react-native';

const API_URL = 'https://pokeapi.co/api/v2';

const TelaPokemon = () => {
    const [pokemons, setPokemons] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [tipoSelecionado, setTipoSelecionado] = useState('all');
    const [carregando, setCarregando] = useState(true);
    const [listaPokemons, setListaPokemons] = useState([]);

    useEffect(() => {

        const buscarTipos = async () => {
            try {
                const resposta = await fetch(`${API_URL}/type`);
                const dados = await resposta.json();
                setTipos(dados.results);
            } catch (erro) { 'Erro' }
        };

        const buscarPokemons = async () => {
            setCarregando(true);
            try {
                const resposta = await fetch(`${API_URL}/pokemon?limit=1500`);
                const dados = await resposta.json();
                const detalhes = await Promise.all(dados.results.map(async (pokemon) => {
                    const respostaPokemon = await fetch(pokemon.url);
                    return respostaPokemon.json();
                }));
                setPokemons(detalhes);
            } catch (erro) { 'Erro' } finally {
                setCarregando(false);
            }
        };
        buscarTipos();
        buscarPokemons();
    }, []);

    useEffect(() => {
        const filtrarPokemons = async () => {
            if (tipoSelecionado === 'all') {
                setListaPokemons(pokemons);
            } else {
                setCarregando(true);
                try {
                    const resposta = await fetch(`${API_URL}/type/${tipoSelecionado}`);
                    const dados = await resposta.json();
                    const pokemonsFiltrados = await Promise.all(dados.pokemon.map(async (p) => {
                        const respostaPokemon = await fetch(p.pokemon.url);
                        return respostaPokemon.json();
                    }));
                    setListaPokemons(pokemonsFiltrados);
                } catch (erro) { } finally {
                    setCarregando(false);
                }
            }
        };
        filtrarPokemons();
    }, [tipoSelecionado, pokemons]);

    return (
        <View style={styles.container}>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={tipoSelecionado}
                    style={styles.picker}
                    onValueChange={(itemValue) => setTipoSelecionado(itemValue)}
                >
                    <Picker.Item label="Todos os tipos" value="all" />
                    {tipos.map((tipo) => (
                        <Picker.Item key={tipo.name} label={tipo.name} value={tipo.name} />
                    ))}
                </Picker>
            </View>
            {carregando ? (
                <Text style={styles.carregandoTexto}>Carregando...</Text>
            ) : (
                <FlatList
                    data={listaPokemons}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => (
                        <View style={styles.pokemonItem}>
                            <Image
                                source={{ uri: item.sprites.front_default }}
                                style={styles.pokemonImage} />
                            <Text style={styles.pokemonNome}>{item.name}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },

    pickerContainer: {
        marginBottom: 20,
    },
    picker: {
        height: 50,
        width: '100%',
    },

    carregandoTexto: {
        fontSize: 19,
        marginTop: 20,
    },

    pokemonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 9,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        textTransform: 'capitalize',
    },

    pokemonImage: {
        width: 50,
        height: 50,
        marginRight: 10,
    },

    pokemonNome: {
        fontSize: 16,
    },

});

export default TelaPokemon;