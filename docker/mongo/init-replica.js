try {
  const status = rs.status();
  print("Replica set already initialized: " + status.set);
} catch (e) {
  print("Initializing replica set rs0...");
  const config = {
    _id: "rs0",
    members: [{ _id: 0, host: "localhost:27017" }]
  };
  rs.initiate(config);
  print("Replica set initialized successfully.");
}
