Feature: Dashboard Register and Login tests

  Background:
    * def config = read('config.json')
    * def basicUrl = config.basicUrl + config.port
    * def adminPassword = config.adminPassword
    * def userPassword = config.userPassword

  # REGISTER /register
  Scenario: register new user
    Given url basicUrl + '/register'
    And request { email: "testemail@test.fr", username: "testusername", password:  #(userPassword) }
    When method post
    Then status 201
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """

  Scenario: register existing user
    Given url basicUrl + '/register'
    And request { email: "testemail@test.fr", username: "testusername", password:  #(userPassword) }
    When method post
    Then status 401

  Scenario: register empty user
    Given url basicUrl + '/register'
    And request {}
    When method post
    Then status 400

  # LOGIN /login
  Scenario: login existing user
    Given url basicUrl + '/login'
    And request { email: "testemail@test.fr", password:  #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """

  Scenario: login non existing user
    Given url basicUrl + '/login'
    And request { email: "nonexisting@test.fr", password: "nonexistingpassword" }
    When method post
    Then status 401

  Scenario: login existing user with wrong password
    Given url basicUrl + '/login'
    And request { email: "testemail@test.fr", password: "nonexistingpassword" }
    When method post
    Then status 401

  Scenario: login empty user
    Given url basicUrl + '/login'
    And request {}
    When method post
    Then status 400

  # GET /user
  Scenario: get all users list as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "testemail@test.fr", password:  #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token

    #get users list

    Given url basicUrl + '/user'
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 403

    Scenario: get all users list as an admin
    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token

    #get users list

    Given url basicUrl + '/user'
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 200


  # GET /user/:id
  Scenario: get own profil as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "testemail@test.fr", password:  #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token
    And def id = response._id

    #get users list

    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 200

  Scenario: get own profil as an admin
    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token
    And def id = response._id

    #get specific user

    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 200
  
    Scenario: get another profil as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "testemail@test.fr", password:  #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token

    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def id = response._id

    #get users list

    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 403

  Scenario: get another profil as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "testemail@test.fr", password:  #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def id = response._id

    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token

    #get users list

    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 200

  ## get a non existing user as an admin


  # PUT /user/:id
  Scenario: change profil data as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "testemail@test.fr", password:  #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def id = response._id
    And def token = response.token

    # change data
    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { username: "NEW_USER_NAME_USER" }
    When method put
    Then status 200

    # change back data
    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { username: "testusername" }
    When method put
    Then status 200

  Scenario: change profil data as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def id = response._id
    And def token = response.token

    # change data
    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { username: "NEW_USERNAME_ADMIN" }
    When method put
    Then status 200

    # change back data
    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { username: "admin_test" }
    When method put
    Then status 200

  Scenario: change information you don't have access to as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "testemail@test.fr", password:  #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token
    And def id = response._id

    # change data
    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { _id: "123456id" }
    When method put
    Then status 403

  Scenario: change information you don't have access to as an admin
    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token
    And def id = response._id

        # change data
    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { _id: "123456id" }
    When method put
    Then status 403


  Scenario: change information of another user as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "testemail@test.fr", password:  #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token

    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def id = response._id

    # change data
    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { username: "NEW_USERNAME_ADMIN" }
    When method put
    Then status 403

  Scenario: change information of another user as an admin
    # login user
    Given url basicUrl + '/login'
    And request { email: "testemail@test.fr", password:  #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def id = response._id

    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token

    # change data
    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { username: "TEST_NAME_NEW" }
    When method put
    Then status 200

    # change back data
    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { username: "test_username" }
    When method put
    Then status 200

  Scenario: change nothing
    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token
    And def id = response._id

        # change data
    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { }
    When method put
    Then status 200

  ## change non existing informations
  Scenario: change non existing informations
    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token
    And def id = response._id

        # change data
    Given url basicUrl + '/user/' + id
    And header Authorization = 'Bearer ' + token
    And request { NOEXIST: "NOEXIST" }
    When method put
    Then status 403

  # DELETE /user/:id
  Scenario: delete non existing account
      # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def token = response.token

    # delete user

    Given url basicUrl + '/user/' + "abcabcabcabcabcabcabcabc"
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method delete
    Then status 200




  Scenario: delete other user as a user and own user
    # login user
    Given url basicUrl + '/login'
    And request { email: "testemail@test.fr", password:  #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def own_id = response._id
    And def user_token = response.token


    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password:  #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def admin_token = response.token
    And def admin_id = response._id

    #delete user
    Given url basicUrl + '/user/' + admin_id
    And header Authorization = 'Bearer ' + user_token
    And request { token: "#(token)" }
    When method delete
    Then status 403

    #delete own user
    Given url basicUrl + '/user/' + own_id
    And header Authorization = 'Bearer ' + user_token
    And request { token: "#(token)" }
    When method delete