Feature: Dashboard Register and Login tests

  Background:
    * def config = read('config.json')
    * def basicUrl = config.basicUrl + config.port
    * def ExternServiceUrl = config.basicUrl + config.externServicePort
    * def adminPassword = config.adminPassword
    * def userPassword = config.userPasswor

  # POST /professionalInfo
  Scenario: Try to create a professionalinfo without being logged
    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    When method post
    Then status 403

  Scenario: Try to create a professionalinfo as an admin
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

    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201

  Scenario: Try to create a professionalinfo as an admin without mandatory informations
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

    Given url ExternServiceUrl + '/professionalInfo'
    And request { companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 403

  Scenario: Try to create a professionalinfo as an admin with too much informations
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

    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type", moreinfo: "test more info", secondmoreinfo: "second test more info", thirdmoreinfo: "third test more info" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 403

  Scenario: Try to create a professionalinfo as an admin with no informations
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

    Given url ExternServiceUrl + '/professionalInfo'
    And request { }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 403

  Scenario: Try to create a professionalinfo as a user
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

    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 403 

  # GET /professionalInfo
  Scenario: Try to get all professionalInfo without being logged
    #get professionalInfo list
    Given url ExternServiceUrl + '/professionalInfo'
    When method get
    Then status 403

  Scenario: Try to create a professionalinfo as an admin
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

    Given url ExternServiceUrl + '/professionalInfo'
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 201

  Scenario: Try to create a professionalinfo as an admin with no informations
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

    Given url ExternServiceUrl + '/professionalInfo'
    And header Authorization = 'Bearer ' + token
    And request { }
    When method get
    Then status 403

  Scenario: Try to create a professionalinfo as an admin with too much informations
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

    Given url ExternServiceUrl + '/professionalInfo'
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)", moreinfo: "test more info", secondmoreinfo: "second test more info", thirdmoreinfo: "third test more info" }
    When method get
    Then status 403

  Scenario: Try to create a professionalinfo as a user
    # login admin
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

    Given url ExternServiceUrl + '/professionalInfo'
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 403

  # GET /professionalInfo:id
  Scenario: Get a specific professionalInfo without being logged
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

    #create a professionalInfo

    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def professionalInfoId = response._id

    #request a specific professionalInfo
    Given url ExternServiceUrl + '/professionalInfo/' + professionalInfoId
    When method get
    Then status 403

  Scenario: Get a specific professionalInfo as an admin
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

    #create a professionalInfo

    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def professionalInfoId = response._id

    #request a specific professionalInfo
    Given url ExternServiceUrl + '/professionalInfo/' + professionalInfoId
    And header Authorization = 'Bearer ' + token
    And request { token: "#(token)" }
    When method get
    Then status 200

  #PUT /professionalInfo/:id
  Scenario: Change a specific professionalInfo element as an admin
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

    #create a professionalInfo

    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def professionalInfoId = response._id

    #change informations on a specific professionalInfo
    Given url ExternServiceUrl + '/professionalInfo/' + professionalInfoId
    And header Authorization = 'Bearer ' + token
    And request { companyName: "New companyName test" }
    When method put
    Then status 200

  Scenario: Change a non existing information of a specific professionalInfo as an admin
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

    #create a professionalInfo

    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def professionalInfoId = response._id

    #change informations on a specific professionalInfo
    Given url ExternServiceUrl + '/professionalInfo/' + professionalInfoId
    And header Authorization = 'Bearer ' + token
    And request { noexistingelement: "noexistingelement" }
    When method put
    Then status 403

  Scenario: Change a information to empty information as an admin
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

    #create a professionalInfo

    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def professionalInfoId = response._id

    #change informations on a specific professionalInfo
    Given url ExternServiceUrl + '/professionalInfo/' + professionalInfoId
    And header Authorization = 'Bearer ' + token
    And request { companyName: "" }
    When method put
    Then status 403

  Scenario: Change a information to a to long information for karate as an admin
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

    #create a professionalInfo

    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def professionalInfoId = response._id

    #change informations on a specific professionalInfo
    Given url ExternServiceUrl + '/professionalInfo/' + professionalInfoId
    And header Authorization = 'Bearer ' + token
    And request { companyName: "test a too long name for karate tests and see if it works correctly" }
    When method put
    Then status 403

  #DELETE /professionalInfo/:id
  Scenario: Delete a specific professionalInfo element as an admin
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

    #create a professionalInfo

    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def professionalInfoId = response._id

    #change informations on a specific professionalInfo
    Given url ExternServiceUrl + '/professionalInfo/' + professionalInfoId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 200

  Scenario: Delete a non existant professionalInfo element as an admin
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

    #create a professionalInfo

    Given url ExternServiceUrl + '/professionalInfo'
    And request { userId: "test userid", companyName: "test companyName", companyAddress: "test companyAddress" , companyAddress2: "test companyAddress2", billingAddress: "test billingAddress", clientNumberTVA: "test clientNumberTVA", personalPhone: "test personalPhone", companyPhone: "test companyPhone", RCS: "test RCS", registrationCity: "test registrationCity", SIREN: "test SIREN", SIRET: "test SIRET", artisanNumber: "test artisanNumber", type: "test type" }
    And header Authorization = 'Bearer ' + token
    When method post
    Then status 201
    And def professionalInfoId = "nonexistantid"

    #change informations on a specific professionalInfo
    Given url ExternServiceUrl + '/professionalInfo/' + professionalInfoId
    And header Authorization = 'Bearer ' + token
    When method Delete
    Then status 403