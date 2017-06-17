'use strict';

const PokemonGO = require('pokemon-go-node-api');

// using var so you can login with multiple users
let a = new PokemonGO.Pokeio();

//Set environment variables or replace placeholder text
let location = {
    type: 'name',
    name: '新宿歌舞伎町'
};



let username = 'masayuki.dm@gmail.com';
let password = '******';
let provider = 'google';
let pokeball = {
    monsterball: 1,
    superball: 2,
    hyperball: 3
}


a.init(username, password, location, provider, (err) => {
    if (err) throw err;

    let fs = require("fs");
    let json = JSON.parse(fs.readFileSync('./pokemon.json', 'utf8'));

    console.log('現在位置：' + a.playerInfo.locationName);
    console.log('lat/long/alt: 緯度: ' + a.playerInfo.latitude + ' 経度：' + a.playerInfo.longitude + ' 高度：' + a.playerInfo.altitude);

    a.GetProfile((err, profile) => {
        if (err) throw err;

        console.log('ユーザー名：' + profile.username);
        console.log('ポケモン所持上限：' + profile.poke_storage);
        console.log('アイテム所持上限：' + profile.item_storage);

        let poke = 0;
        if (profile.currency[0].amount) {
            poke = profile.currency[0].amount;
        }

        console.log('ポケコイン：' + poke);
        console.log('ほしのすな：' + profile.currency[1].amount);

        setInterval(() => {
            a.Heartbeat((err,hb)=>{
                if(err) {
                    console.log(err);
                }

                let texts = '';
                for (var i = hb.cells.length - 1; i >= 0; i--) {
                    if(hb.cells[i].NearbyPokemon[0]) {
                        let pokemon = a.pokemonlist[parseInt(hb.cells[i].NearbyPokemon[0].PokedexNumber)-1];
                        for(var j = 0 ; j<json.length ; j++ ){
                          if(pokemon.name === json[j].en){
                            console.log("やせいの「" + json[j].ja + "」が近くにいる。");
                          }
                        }

                    }
                }

                for (i = hb.cells.length - 1; i >= 0; i--) {
                    for (var j = hb.cells[i].MapPokemon.length - 1; j >= 0; j--)
                    {
                      // use async lib with each or eachSeries should be better :)
                        let currentPokemon = hb.cells[i].MapPokemon[j];
                        (function(currentPokemon) {
                            let pokedexInfo = a.pokemonlist[parseInt(currentPokemon.PokedexTypeId)-1];
                            for(var k = 0 ; k<json.length ; k++) {
                              if(pokedexInfo.name === json[k].en) {
                                pokedexInfo.name = json[k].ja
                              }
                            }

                            a.EncounterPokemon(currentPokemon, function(suc, dat) {
                              console.log('やせいの「' + pokedexInfo.name + "」が飛び出してきた。");
                              if(dat){
                                console.log(dat.WildPokemon.pokemon);
                                a.CatchPokemon(currentPokemon, 1, 1.950, 1, pokeball.superball, function(xsuc, xdat) {
                                  if(dat.WildPokemon.pokemon.cp < 100){
                                    console.log("cpが100未満のポケモンは雑魚だからいらない。");
                                    console.log("無視した。");
                                    return
                                  }
                                  console.log("cp:" + dat.WildPokemon.pokemon.cp + "の" + pokedexInfo.name + "をつかまえよう！");
                                  console.log('xdat：' + xdat);
                                    let status = ['予期しないエラー', 'やった！つかまえた', 'エスケープ', '逃げられた。', '外した'];
                                    if(xdat) {
                                      console.log("ボールを投げた！");
                                      console.log('xdat.Status：' + status[xdat.Status]);
                                      if(xdat.Status == 1) {
                                        console.log(pokedexInfo.name + "をつかまえた！");
                                      }
                                    }
                                });
                              }
                            });
                        })(currentPokemon);

                    }
                }
            });
        }, 800);

    });
});
