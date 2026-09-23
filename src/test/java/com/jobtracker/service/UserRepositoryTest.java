package com.jobtracker.repository;

import com.jobtracker.model.User;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void findByEmail_shouldReturnUser() {

        User user = new User(
                "John",
                "john@gmail.com",
                "password123"
        );

        userRepository.save(user);

        Optional<User> result =
                userRepository.findByEmail("john@gmail.com");

        assertThat(result).isPresent();
        assertThat(result.get().getName())
                .isEqualTo("John");
        assertThat(result.get().getEmail())
                .isEqualTo("john@gmail.com");
    }

    @Test
    void findByEmail_shouldReturnEmptyForUnknownEmail() {

        Optional<User> result =
                userRepository.findByEmail("unknown@gmail.com");

        assertThat(result).isEmpty();
    }

    @Test
    void findByEmail_shouldReturnCorrectUser() {

        User user1 = new User(
                "John",
                "john@gmail.com",
                "password123"
        );

        User user2 = new User(
                "David",
                "david@gmail.com",
                "password456"
        );

        userRepository.save(user1);
        userRepository.save(user2);

        Optional<User> result =
                userRepository.findByEmail("david@gmail.com");

        assertThat(result).isPresent();
        assertThat(result.get().getName())
                .isEqualTo("David");
    }
}