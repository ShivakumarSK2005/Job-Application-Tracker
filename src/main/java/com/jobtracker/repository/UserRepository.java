package com.jobtracker.repository;

import com.jobtracker.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);
}



// Why Optional<User> here?

// Because an email may or may not exist in MongoDB.

// findByEmail("abc@gmail.com")
//         ↓
// User exists    → Optional containing User
// User doesn't exist → Optional.empty()

// And Spring Data generates the MongoDB query automatically from:

// findByEmail