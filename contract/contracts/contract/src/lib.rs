#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    symbol_short, Env, Address, String, Map, Vec
};

#[contract]
pub struct NFTGallery;

#[contracttype]
#[derive(Clone)]
pub struct NFT {
    pub owner: Address,
    pub name: String,
    pub uri: String,
}

#[contractimpl]
impl NFTGallery {

    // 🔹 Mint a new NFT
    pub fn mint(env: Env, owner: Address, name: String, uri: String) {
        owner.require_auth();

        let key = symbol_short!("NFTS");

        let mut nfts: Map<u32, NFT> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(Map::new(&env));

        let id: u32 = nfts.len();

        let nft = NFT {
            owner: owner.clone(),
            name,
            uri,
        };

        nfts.set(id, nft);

        env.storage().instance().set(&key, &nfts);
    }

    // 🔹 Get NFT by ID
    pub fn get_nft(env: Env, id: u32) -> Option<NFT> {
        let key = symbol_short!("NFTS");

        let nfts: Map<u32, NFT> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(Map::new(&env));

        nfts.get(id)
    }

    // 🔹 Get all NFTs
    pub fn get_all(env: Env) -> Vec<NFT> {
        let key = symbol_short!("NFTS");

        let nfts: Map<u32, NFT> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(Map::new(&env));

        let mut result = Vec::new(&env);

        for (_, nft) in nfts.iter() {
            result.push_back(nft);
        }

        result
    }
}