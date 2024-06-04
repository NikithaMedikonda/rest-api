import { captureRejectionSymbol } from "events";
import express, { Request, Response } from "express";


const app = express()
const port = 3000

app.use(express.json());

interface User {
    id: number;
    username: string;
    password: string;
    email: string;
    fullname: string;
    providerId?: number;
    meterId?: number;
}
  
interface Provider {
    id: number;
    name: string;
    charge: number;
}

interface readings { 
  units: number, 
  time: Date }

interface Meter{
    id: number;
    name: string;
    reading: readings[];
}
let users: User[] = [];

const providers: Provider[] = [
    { id: 1, name: "Electro", charge: 5 },
    { id: 2, name: "Magneto", charge: 10 }
  ];

let meters: Meter[] = [];

// Return all users
app.get('/users', (req, res) => {
    res.json(users);
});

// Create a user with attributes username, password, email and fullname
app.post('/users', (req, res) => {
    const { username, password, email, fullname } = req.body;
    const newUser: User = {
    id: users.length + 1,
    username,
    password,
    email,
    fullname
  };
  users.push(newUser);
    console.log(req.body);
    res.send('hello')
    // use req.body
});

// Return a user with parameter id if not exists return message saying `user not found`
app.get('/users/:id', (req: Request, res: Response) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (user) {
      res.json(user);
    } else {
      res.send('User not found');
    }
  });
  
// update user information for given id 
app.put('/users/:id', (req: Request, res: Response) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (user) {
      const { username, password, email, fullname } = req.body;
      if (username) user.username = username;
      if (password) user.password = password;
      if (email) user.email = email;
      if (fullname) user.fullname = fullname;
      res.json(user);
    } else {
      res.send('User not found');
    }
  });

// delete user for given id
app.delete('/users/:id', (req: Request, res: Response) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index !== -1) {
      users.splice(index, 1);
      res.send();
    } else {
      res.send('User not found');
    }
  });

// Get all providers
app.get('/providers', (req: Request, res: Response) => {
    res.json(providers);
  });
  
// Create a provider
app.post('/providers', (req: Request, res: Response) => {
    const { name, charge } = req.body;
    const newProvider: Provider = {
      id: providers.length + 1,
      name,
      charge
    };
    providers.push(newProvider);
    res.json(newProvider);
  });
  
// Update a provider by id
app.put('/providers/:id', (req: Request, res: Response) => {
    const provider = providers.find(p => p.id === parseInt(req.params.id));
    if (provider) {
      const { name, charge } = req.body;
      if (name) provider.name = name;
      if (charge) provider.charge = charge;
      res.json(provider);
    } else {
      res.send('Provider not found');
    }
  });
  
// Delete a provider by id
app.delete('/providers/:id', (req: Request, res: Response) => {
    const index = providers.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
      providers.splice(index, 1);
      res.send();
    } else {
      res.send('Provider not found');
    }
  });
  
// User Subscription to Providers
app.post('/users/:id/subscribe', (req: Request, res: Response) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    const providerId = parseInt(req.body.providerId);
    if (user && providers.find(p => p.id === providerId)) {
      user.providerId = providerId;
      res.json(user);
    } else {
      res.send('User or Provider not found');
    }
  });
  
// Meter APIs
  
// get all meters
app.get("/meters", (req:Request, res: Response) =>{
  res.json(meters);
})

// Create a meter
app.post('/meters', (req: Request, res: Response) => {
    const { name } = req.body;
    //const user = users.find(u => u.id === userId);
    const newMeter: Meter = {
      id: meters.length + 1,
      name,
      reading: []
    };
    meters.push(newMeter);
    res.json(newMeter);
  });
  
 // Store meter reading
app.post("/meters/:id/reading", (req: Request, res: Response) => {
    const meter = meters.find((m) => m.id === parseInt(req.params.id));
    if (meter) {
      const { units, time } = req.body;
      const readings={units,time}
      meter.reading.push(readings)
      console.log(meter.reading)
      res.json(meter);
    } else {
      res.send("Meter not found");
    }
  });
 
  // adding a meter
  app.post('/users/:id/addMeter', (req: Request, res: Response) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    const meterId = parseInt(req.body.meterId);
    if (user && meters.find(p => p.id === meterId)) {
      user.meterId = meterId;
      res.json(user);
    } else {
      res.send('User or Provider not found');
    }
  });

// Get meter reading
app.get("/meters/:id/reading", (req: Request, res: Response) => {
    const meter = meters.find((m) => m.id === parseInt(req.params.id));
    if (meter) {
      res.json(meter.reading);
    } else {
      res.send("Meter not found");
    }
  });
  
// Get all readings by user ID
 app.get('/users/:id/readings', (req, res) => {
    //const user = users.find(u => u.id === parseInt(req.params.id));
        const user = users.find(user => user.meterId == parseInt(req.params.id));
        if(user){
          const meter = meters.find(meter=> meter.id===user.meterId)
            //const userReadings = meter.reading
            if(meter){
              res.json(meter.reading);
            }
        }
    }
);
  
// Calculate bill for user
app.get("/users/:id/bill", (req: Request, res: Response) => {
    const user = users.find((u) => u.id === parseInt(req.params.id));
    if (user) {     
      const provider = providers.find(p => p.id === user.providerId);
      const userMeters = meters.find(m => m.id == user.meterId);
      if (userMeters){
        const userReadings = userMeters.reading       
        const totalUnits = userReadings.reduce((sum, m) => sum + m.units , 0);       
        const bill = totalUnits * (provider ? provider.charge : 0);
        res.json({ user_id: user.id, amount: bill });
    } 
  }else {
      res.send("User or Provider not found");
    }
  });

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`)
})