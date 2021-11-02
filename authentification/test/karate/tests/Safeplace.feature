Feature: Dashboard Register and Login tests

  Background:
    * def config = read('config.json')
    * def basicUrl = config.basicUrl + config.port
    * def ExternServiceUrl = config.basicUrl + config.externServicePort
    * def adminPassword = config.adminPassword
    * def userPassword = config.userPassword

  # POST /safeplace
  Scenario: Try to create a request/claim without being logged
    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { userId: "111112222233333444445555", safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending", safeplaceDescription: "test safeplaceDescription", userComment: "test userComment", coordinate: ["1254", "4521"], }
    When method post
    Then status 403
  
  Scenario: Try to create a request/claim as an admin
    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending 1", safeplaceDescription: "test safeplaceDescription 1", userComment: "test userComment 1", coordinate: ["1254 1", "4521"], }
    And header Authorization = 'Bearer ' + token
    And karate.log(config.adminPassword)
    When method post
    Then status 201

    And def requestClaimSafeplaceId = response._id
    
    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Try to create a request/claim as an admin and modify the userId
    # login user
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace and change userId

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", userId: "111112222233333444445555",safeplaceName: "___test___", status: "pending 2", safeplaceDescription: "test safeplaceDescription 2", userComment: "test userComment 2", coordinate: ["1254 2", "4521 2"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201

    And def requestClaimSafeplaceId = response._id
    
    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Try to create a request/claim as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending 3", safeplaceDescription: "test safeplaceDescription 3", userComment: "test userComment 3", coordinate: ["1254 3", "4521 3"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201

    And def requestClaimSafeplaceId = response._id
    
    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Try to create a safeplace as a user and modify the userId
    # login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace and change userId

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", userId: "111112222233333444445555", safeplaceName: "___test___", status: "pending 4", safeplaceDescription: "test safeplaceDescription 4", userComment: "test userComment 4", coordinate: ["1254 4", "4521 4"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
  
    And def requestClaimSafeplaceId = response._id
    
    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200
  
  Scenario: Try to create a safeplace and without all needed informations as an admin
    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", status: "pending 5", userComment: "test userComment 5" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 403

  Scenario: Try to create a safeplace and without all needed informations as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace and change userId

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", status: "pending 6", userComment: "test userComment 6" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 403

  Scenario: Try to create a safeplace and only with needed informations as an admin
    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace only with needed informations

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceName: "___test___", safeplaceDescription: "test safeplaceDescription 7", coordinate: ["1254 7", "4521 7"] }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201

    And def requestClaimSafeplaceId = response._id
    
    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Try to create a safeplace and only with needed informations as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace only with needed informations

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceName: "___test___", safeplaceDescription: "test safeplaceDescription 8", coordinate: ["1254 8", "4521 8"] }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201

    And def requestClaimSafeplaceId = response._id
    
    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Try to create a safeplace with too much informations as an admin
    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace with too much informations

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", userId: "111112222233333444445555", safeplaceName: "___test___", status: "pending 4", safeplaceDescription: "test safeplaceDescription 4", userComment: "test userComment 4", coordinate: ["1254 4", "4521 4"], moreinfo: "test more info", secondmoreinfo: "second test more info", thirdmoreinfo: "third test more info"}
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 403

Scenario: Try to create a safeplace with too much informations as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace with too much informations

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", userId: "111112222233333444445555", safeplaceName: "___test___", status: "pending 4", safeplaceDescription: "test safeplaceDescription 4", userComment: "test userComment 4", coordinate: ["1254 4", "4521 4"], moreinfo: "test more info", secondmoreinfo: "second test more info", thirdmoreinfo: "third test more info"}
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 403

  Scenario: Try to create a safeplace with too much informations as an admin
    # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace and empty values

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 403

Scenario: Try to create a safeplace with too much informations as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace and empty values

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 403

# GET safeplace
  Scenario: Try to get all safeplace without being logged
    #get requestClaimSafeplace list
    Given url ExternServiceUrl + '/requestClaimSafeplace'
    When method get
    Then status 403
  
  Scenario: Try to get all safeplace as a user
    # login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #get safeplace list

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 403

  Scenario: Try to get all safeplace as an admin
  # login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #get safeplace list

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 200

# GET /safeplace/:id
  Scenario: Get a specific safeplace without being logged
    # login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending 3", safeplaceDescription: "test safeplaceDescription 3", userComment: "test userComment 3", coordinate: ["1254 3", "4521 3"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #request a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    When method get
    Then status 403

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200



  Scenario: Get own safeplace as an admin
    #login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending 3", safeplaceDescription: "test safeplaceDescription 3", userComment: "test userComment 3", coordinate: ["1254 3", "4521 3"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #request a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 200

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200


  Scenario: Get own safeplace as a user
  #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending 3", safeplaceDescription: "test safeplaceDescription 3", userComment: "test userComment 3", coordinate: ["1254 3", "4521 3"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #request a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 200

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200


  Scenario: Get other user safeplace as an admin
   #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def usertoken = response.token

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending 3", safeplaceDescription: "test safeplaceDescription 3", userComment: "test userComment 3", coordinate: ["1254 3", "4521 3"], }
    And header Authorization = 'Bearer ' + usertoken
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

   #login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #request a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 200

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200
  

  Scenario: Get other user safeplace as a user
  #login user
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def admintoken = response.token

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending 3", safeplaceDescription: "test safeplaceDescription 3", userComment: "test userComment 3", coordinate: ["1254 3", "4521 3"], }
    And header Authorization = 'Bearer ' + admintoken
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

   #login admin
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #request a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 403
  
    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + admintoken
    When method Delete
    Then status 200

#PUT /safeplace/:id
  Scenario: Change information of own safeplace as an admin
  #login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #change informations on a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { safeplaceDescription: "New safeplace description test" }
    When method put
    Then status 200

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200


  Scenario: Change information of own safeplace as a user
    #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #change informations on a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { safeplaceDescription: "New safeplace description test" }
    When method put
    Then status 200

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Change information of another one's safeplace as an admin
    #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def usertoken = response.token

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + usertoken
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id
  
    #login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #change informations on a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { safeplaceDescription: "New safeplace description test" }
    When method put
    Then status 200

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Change information of another one's safeplace as a user
    #login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def admintoken = response.token

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + admintoken
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id
  
    #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #change informations on a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { safeplaceDescription: "New safeplace description test" }
    When method put
    Then status 403

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + admintoken
    When method Delete
    Then status 200

  Scenario: Change non existing information of a safeplace as an admin
    #login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #change informations on a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { noexistingelement: "noexistingelement" }
    When method put
    Then status 403

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Change non existing information of a safeplace as a user
    #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #change informations on a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { noexistingelement: "noexistingelement" }
    When method put
    Then status 403

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Change information to empty information as an admin
    #login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #change informations on a specificsafeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { safeplaceDescription: "" }
    When method put
    Then status 403

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Change information to empty information as a user
    #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #change informations on a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { safeplaceDescription: "" }
    When method put
    Then status 403

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Change information to too large new information as an admin
    #login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #change informations on a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { safeplaceName: "test a too long name for karate tests and see if it works correctly" }
    When method put
    Then status 403

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Change information to too large new information as a user
    #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #change informations on a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { safeplaceName: "test a too long name for karate tests and see if it works correctly" }
    When method put
    Then status 403

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Change unhautorized information as a user
    #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id

    #change informations on a specific safeplace
    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    And request { status: "unauthorized" }
    When method put
    Then status 200

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200


#DELETE
  Scenario: Delete own safeplace as an admin
    #login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id
  
    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Delete own safeplace as a user
  #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id
  
    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Delete other user safeplace as an admin
    #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id
  
    #login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + admin_token
    When method Delete
    Then status 200

  Scenario: Delete other user safeplace as a user
    #login admin
    Given url basicUrl + '/login'
    And request { email: "admin_testg@test.fr", password: #(adminPassword) }
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

    #create a safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace'
    And request { safeplaceId: "111112222233333444445555", safeplaceName: "___test___", status: "pending put", safeplaceDescription: "test safeplaceDescription put", userComment: "test userComment put", coordinate: ["1254 put", "4521 put"], }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def requestClaimSafeplaceId = response._id
  
    #login user
    Given url basicUrl + '/login'
    And request { email: "test@test.fr", password: #(userPassword) }
    When method post
    Then status 200
    And match response contains
    """
    {
        _id: '#notnull',
        token: '#notnull'
    }
    """
    And def user_token = response.token

    #Delete safeplace

    Given url ExternServiceUrl + '/requestClaimSafeplace/' + requestClaimSafeplaceId
    And header Authorization = 'Bearer ' + user_token
    When method Delete
    Then status 403