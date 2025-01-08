const  axios2 = require("axios");


const BACKEND_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3001"

const axios = {
       post: async (...args) => {
        try {
            const res = await axios2.post(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    get: async (...args) => {
        try {
            const res = await axios2.get(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    put: async (...args) => {
        try {
            const res = await axios2.put(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    delete: async (...args) => {
        try {
            const res = await axios2.delete(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
}

describe.skip("Authentication", () => {
    test("user is able to signup only once", async () => {
        const username = "himani" + Math.random();
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        expect(response.status).toBe(200);

        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        expect(updatedResponse.status).toBe(400);
    });

    test("Signup request is rejected if username is null", async () => {
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, { password });
        expect(response.status).toBe(400);
    });

    test("Signin succeeds if the username and password are correct", async () => {
        const username = `himani-${Math.random()}`;
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, { 
            username,
             password,
            type: "admin"
         });
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, { username, password });

        expect(response.status).toBe(200);
        expect(response.data.token).toBeDefined();
    });

    test("Signin fails if the username and password are incorrect", async () => {
        const username = `himani-${Math.random()}`;
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, { username, password });
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "Himani",
            password
        });

        expect(response.status).toBe(403);
    });
});




//update meta data endpoint
describe.skip("User metadata endpoint",()=> {
    let token = "";
    let avatarId = "";
    beforeAll(async ()=>{
        const username = `himani-${Math.random()}`
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, { username, password, type: "admin" });
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, { username, password});

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        },{
            headers: {
                "authorization":`Bearer ${token}`
            }
        });

        avatarId = avatarResponse.data.avatarId;
        
    })
    test("User can't update their metadata with wrong avatarId", async ()=>{

        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123123"
        },{
            headers: {
                "authorization": `Bearer ${token}`
            }
        })
        expect(response.status).toBe(400)
    })
    test("User can update their metadata with right avatarId", async()=>{

        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, { 
            avatarId,
        }, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        });
        
        expect(response.status).toBe(200)


    });

    test("user cannot update their metadata if the auth header is not present", async()=> {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        });
        expect(response.status).toBe(403);
    })
})

describe.skip("User avatar information", () => {
    let avatarId;
    let token;
    let userId;
    beforeAll(async ()=>{
        const username = `himani-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, { username, password, type: "admin" });
         userId = signupResponse.data.userId
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, { username, password});

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });

        avatarId = avatarResponse.data.avatarId;
        
    });

    test("Get back avatar information for a user", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);

    })

    test("Available avatar lists the recently made avatar", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.toBe(0);
        const currentAvatar = response.data.avatars.find(x => x.id == avatarId);
        expect(currentAvatar).toBeDefined();
    })
})

describe("Space Information", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;
    beforeAll(async ()=>{
        const username = `himani-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, { username, password, type: "admin" });
        
        adminId = signupResponse.data.userId
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, { username, password});
        
        adminToken = response.data.token;
        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, { username: username + "-user", 
             password,
              type: "user" 
            });
        
        userId = userSignupResponse.data.userId
        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, { username: username + "-user", 
             password
            });
        
        userToken = userSigninResponse.data.token;
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerX0IkJTG1GpZ9ZqSGYafQPT0Wy_JTCmV5RHXsAsWQC3tKnMLH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
        }, {
            headers: {
                authorization : `Bearer ${adminToken}`
            }
        });

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerX0IkJTG1GpZ9ZqSGYafQPT0Wy_JTCmV5RHXsAsWQC3tKnMLH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
        }, {
            headers: {
                authorization : `Bearer ${adminToken}`
            }
        });

        element1Id = element1Response.data.id;
        element2Id = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail" : "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y: 20
            }, {
                elementId: element1Id,
                x: 18,
                y: 20
            }, {
                elementId: element2Id,
                x: 19,
                y:20
            }]

        },{
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        mapId =  mapResponse.data.id;

    })
    test("user is able to create a space", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        expect(response.data.spaceId).toBeDefined()
    })

    test("user is able to create a empty space without MapId", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });

        expect(response.data.spaceId).toBeDefined();
    })

    test("user is not able to create a space without mapId and dimensions", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "test"
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        expect(response.status).toBe(400);
    })

    test("User is not able to delete a space that doesnt exist", async ()=> {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExist`, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400)
    })

    test("User is able to delete a space that does exist", async ()=> {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });

        expect(deleteResponse.status).toBe(200)

    })

    test("user should not be able to delete a space created by another user", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        expect(deleteResponse.status).toBe(403)

    })

    test("admin has no spaces initially", async()=>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        expect(response.data.spaces.length).toBe(0)
    })

    test("admin can create a space", async () => {
        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        const filteredSpace = response.data.spaces.find(x => x.id == spaceCreateResponse.data.spaceId)
        expect(response.data.spaces.length).toBe(1)
        expect(filteredSpace).toBeDefined()
    })


})

// //start
describe("Arena endpoints", ()=> {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;
    let spaceId;
    beforeAll(async ()=>{
        const username = `himani-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, 
            { 
                username, 
                password, 
                type: "admin"

             });
        
        adminId = signupResponse.data.userId
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, { username, password});
        
        adminToken = response.data.token;
        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, { 
            username: username + "-user", 
            password, 
            type: "user" });
        
        userId = userSignupResponse.data.userId
        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, { 
            username: username + "-user", 
             password});
        
        userToken = userSigninResponse.data.token;
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerX0IkJTG1GpZ9ZqSGYafQPT0Wy_JTCmV5RHXsAsWQC3tKnMLH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
        }, {
            headers: {
                authorization : `Bearer ${adminToken}`
            }
        });

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerX0IkJTG1GpZ9ZqSGYafQPT0Wy_JTCmV5RHXsAsWQC3tKnMLH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
        }, {
            headers: {
                authorization : `Bearer ${adminToken}`
            }
        });

        element1Id = element1Response.data.id;
        element2Id = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail" : "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y: 20
            }, {
                elementId: element1Id,
                x: 18,
                y: 20
            }, {
                elementId: element2Id,
                x: 19,
                y:20
            }]

        },{
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        mapId = mapResponse.data.id;

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId

        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });

        spaceId = spaceResponse.data.spaceId

    });

    test("Incorrect spaceId returns a 400", async () => {
       const response = axios.get(`${BACKEND_URL}/api/v1/space/12334fe`,{
        headers: {
            "authorization": `Bearer ${userToken}`
        }
       })
       expect(response.status).toBe(400)

    })
    test("Correct spaceId returns all the elements", async () => {
       const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
        headers: {
            "authorization": `Bearer ${userToken}`
        }
       })
       //here
       expect(response.data.dimensions).toBe("100x200");
       expect(response.data.elements.length).toBe(3);

    });
    test("delete endpoint is able to delete an element", async () => {
       const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
        headers: {
            "authorization": `Bearer ${userToken}`
        }
       });
       await axios.delete(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
        headers: {
            "authorization": `Bearer ${userToken}`
        },
        data: {
           
                spaceId: spaceId,
                elementId: response.data.elements[0].id
               
        }
       });
       const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
        headers: {
            "authorization": `Bearer ${userToken}`
        }
       });
       expect(newResponse.data.elements.length).toBe(2);

    });
    test("Adding an element fails if the element lies outside the dimensions", async () => {
        const newResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
          "elementId": element1Id,
          "spaceId": spaceId,
          "x": 10000,
          "y": 210000
         }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            } 
        });
        
         expect(newResponse.status).toBe(400);
  
      });

    test("Adding an element works as expected", async () => {
       await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
         "elementId": element1Id,
         "spaceId": spaceId,
         "x": 50,
         "y": 20
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });
       
        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
    });
        expect(newResponse.data.elements.length).toBe(3);
 
     });
 


})

describe("Admin endpoints", ()=> {
    
    let adminToken;
    let adminId;
    let userToken;
    let userId;
    
    beforeAll(async ()=>{
        const username = `himani-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, 
            { 
                username, 
                password, 
                type: "admin"

             });
        
        adminId = signupResponse.data.userId
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, { username, password});
        
        adminToken = response.data.token;
        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, { 
            username: username + "-user", 
            password, 
            type: "user" });
        
        userId = userSignupResponse.data.userId
        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, { 
            username: username + "-user", 
             password});
        
        userToken = userSigninResponse.data.token;

    });

    test("user is not able to hit admin endpoints", async ()=>{
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerX0IkJTG1GpZ9ZqSGYafQPT0Wy_JTCmV5RHXsAsWQC3tKnMLH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
        }, {
            headers: {
                authorization : `Bearer ${userToken}`
            }
        });
        
        
        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail" : "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements": []
            
        },{
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
       
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s"
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });
        expect(elementResponse.status).toBe(403);
        expect(mapResponse.status).toBe(403);
        expect(avatarResponse.status).toBe(403);
        expect(updateElementResponse.status).toBe(403)
       

    });

    test("Admin is able to hit admin endpoints", async ()=>{
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerX0IkJTG1GpZ9ZqSGYafQPT0Wy_JTCmV5RHXsAsWQC3tKnMLH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
        }, {
            headers: {
                authorization : `Bearer ${adminToken}`
            }
        });
        
        
        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail" : "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements": []
            
        },{
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
       
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        });

        
        expect(elementResponse.status).toBe(200);
        expect(mapResponse.status).toBe(200);
        expect(avatarResponse.status).toBe(200);
        
       

    });

    test("Admin is able to update a imageUrl for an element", async ()=> {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerX0IkJTG1GpZ9ZqSGYafQPT0Wy_JTCmV5RHXsAsWQC3tKnMLH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true,
        }, {
            headers: {
                authorization : `Bearer ${adminToken}`
            }
        });
        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s"
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        });

        expect(updateElementResponse.status).toBe(200);
    })
    
      
});

// describe("Websocket tests", () => {
//     let adminToken;
//     let adminUserId;
//     let userToken;
//     let userId;
//     let mapId;
//     let element1Id;
//     let element2Id;
//     let spaceId;
//     let ws1;
//     let ws2;
//     let ws1Messages = [];
//     let ws2Messages = [];
//     let userX;
//     let userY;
//     let adminX;
//     let adminY;

//     function waitForAndPopLatestMessage(messageArray){
//         return new Promise(r => {
//             if(messageArray.length > 0){
//                 resolve(messageArray.shift())
//             }else{
//                 let interval = setInterval(() => {
//                     if(messageArray.length > 0){
//                         resolve(messageArray.shift());
//                         clearInterval(interval)
//                     }
//                 }, 100)
//             }
//         })
//     }

//     async function setupHTTP(){
//         const username = `kirat-${Math.random()}`
//         const password = "123456";
//         const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username,
//             password,
//             role: "admin"
//         });
//         const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username,
//             password
//         });

//         adminUserId = adminSignupResponse.data.userId;

//         adminToken = adminSigninResponse.data.token;

//         const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username: username + "-user",
//             password,
//             role: "user"
//         });
//         const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username: username + "-user",
//             password
//         });
//         userId = userSignupResponse.data.userId;
//         userToken = userSigninResponse.data.token;
//         const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerX0IkJTG1GpZ9ZqSGYafQPT0Wy_JTCmV5RHXsAsWQC3tKnMLH_CsibsSZ5oJtbakq&usqp=CAE",
//             "width": 1,
//             "height": 1,
//             "static": true,
//         }, {
//             headers: {
//                 authorization : `Bearer ${adminToken}`
//             }
//         });

//         const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerX0IkJTG1GpZ9ZqSGYafQPT0Wy_JTCmV5RHXsAsWQC3tKnMLH_CsibsSZ5oJtbakq&usqp=CAE",
//             "width": 1,
//             "height": 1,
//             "static": true,
//         }, {
//             headers: {
//                 authorization : `Bearer ${adminToken}`
//             }
//         });

//         element1Id = element1Response.data.id;
//         element2Id = element2Response.data.id;

//         const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
//             "thumbnail" : "https://thumbnail.com/a.png",
//             "dimensions": "100x200",
//             "defaultElements": [{
//                 elementId: element1Id,
//                 x: 20,
//                 y: 20
//             }, {
//                 elementId: element1Id,
//                 x: 18,
//                 y: 20
//             }, {
//                 elementId: element2Id,
//                 x: 19,
//                 y:20
//             }]

//         },{
//             headers: {
//                 authorization: `Bearer ${adminToken}`
//             }
//         });
//         mapId = mapResponse.data.id;

//         const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`,{
//             "name": "Test",
//             "dimensions": "100x200",
//             "mapId": mapId

//         }, {
//             headers: {
//                 "authorization": `Bearer ${userToken}`
//             }
//         });

//         spaceId = spaceResponse.data.spaceId

//     }

//     async function setupWs(){
//      ws1 = new WebSocket(WS_URL);
    

//      await new Promise(r =>{
//         ws1.onopen = r
//      });
//      ws1.onmessage = (event) => {
//         ws1Messages.push(JSON.parse(event.data))
//      }

//      ws2 = new WebSocket(WS_URL);

//      await new Promise(r => {
//         ws2.onopen = r
//      });

     
//      ws2.onmessage = (event) => {
//         ws2Messages.push(JSON.parse(event.data))
//      }

    
//     }
    

//     beforeAll(async()=> {
//         setupHTTP()
//         setupWs()
        
//     });

//     test("get back acknowlwdgement for joining the space", async()=> {
//         ws1.send(JSON.stringify({
//             "type": "join",
//             "payload": {
//                 "spaceId" : spaceId,
//                  "token": adminToken
//             }
//          }));
//          const message1 = await waitForAndPopLatestMessage(ws1Messages);
    
//          ws2.send(JSON.stringify({
//             "type": "join",
//             "payload": {
//                 "spaceId": spaceId,
//                 "token": userToken
//             }
//          }));

//          const message2 = await waitForAndPopLatestMessage(ws2Messages);
//          const message3 = await waitForAndPopLatestMessage(ws1Messages);

//          expect(message1.type).toBe("space-joined");
//          expect(message2.type).toBe("space-joined");

//          expect(message1.payload.users.length).toBe(0);
//          expect(message2.payload.users.length).toBe(1);
//          expect(message3.type).toBe("user-join");
//          expect(message3.payload.x).toBe(message2.payload.spawn.x);
//          expect(message3.payload.y).toBe(message2.payload.spawn.y);
//          expect(message3.payload.userId).toBe(userId);

//          adminX = message1.payload.spawn.x;
//          adminY = message1.payload.spawn.y;

//          userX = message2.payload.spawn.x;
//          userY = message2.payload.spawn.y
//     });

//     test("User should not be able to move across the boundary of the wall", async ()=> {
//         ws1.send(JSON.stringify({
//             type: "movement",
//             payload: {
//                 x: 100000,
//                 y: 10000
//             }
//         }));

//         const message = await waitForAndPopLatestMessage(ws1Messages);
//         expect(message.type).toBe("movement-rejected");
//         expect(message.payload.x).toBe(adminX);
//         expect(message.payload.y).toBe(adminY);
//     })

//     test("User should not be able to move two blocks at the same time", async ()=> {
//         ws1.send(JSON.stringify({
//             type: "movement",
//             payload: {
//                 x: adminX + 2,
//                 y: adminY
//             }
//         }));

//         const message = await waitForAndPopLatestMessage(ws1Messages);
//         expect(message.type).toBe("movement-rejected");
//         expect(message.payload.x).toBe(adminX);
//         expect(message.payload.y).toBe(adminY);
//     });

//     test("Correct movement should be broadcasted to the other sockets in the room", async ()=> {
//         ws1.send(JSON.stringify({
//             type: "movement",
//             payload: {
//                 x: adminX + 1,
//                 y: adminY,
//                 userId: adminId
//             }
//         }));

//         const message = await waitForAndPopLatestMessage(ws2Messages);
//         expect(message.type).toBe("movement");
//         expect(message.payload.x).toBe(adminX + 1);
//         expect(message.payload.y).toBe(adminY);
//     });

//     test("If a user leaves, the other user receives a leave event", async ()=> {
//         ws1.close();

//         const message = await waitForAndPopLatestMessage(ws2Messages);
//         expect(message.type).toBe("user-left");
//         expect(message.payload.userId).toBe(adminUserId);
        
//     })

// })



//describe blocks = tests accomodation? suites