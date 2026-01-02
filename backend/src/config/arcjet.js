import arcjet , {tokenBucket,shield,detectBot } from '@arcjet/node'

export const aj = arcjet({
  key:process.env.ARCJET_KEY,
  characteristics:['api.src'],
  rules:[
    shield({mode:'LIVE'}),

    detectBot({
        mode:'LIVE',
        allow:["CATEGORY:SEARCH_ENGINE"]
    }),

    tokenBucket({
        mode:'LIVE',
        refillRate:10,
        interval:10,
        capacity:15
    })
  ],
  
})