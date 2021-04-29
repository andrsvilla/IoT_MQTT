//variables de mqtt

var mqtt = require('mqtt');// obtener el paquete mqtt
var hostMqtt = "localhost";
var port = 1883;
//variables de mongo db
var mongodb = require('mongodb');
var mongodbClient = mongodb.MongoClient;
var mongodbURI = 'mongodb://localhost:27017/house';
var topicSubscribe = "casa/+/luz";

var clientMqtt;

function conectionCreate(error, cliente) {
    if (error) throw error;

    var database = cliente.db("iotDbTest");
    var collection = database.collection("casa");

    clientMqtt = mqtt.connect({ host: hostMqtt, port: port });
    clientMqtt.subscribe(topicSubscribe);
    clientMqtt.on("message", function (topic, message) {
        var messageDecrypt = message.toString('utf8');
        try {
            console.log(message, messageDecrypt);
            messageDecrypt = JSON.parse(messageDecrypt);
            let str = topic;
            var datoDeEntrada = messageDecrypt;
            var obj={};
            var objOriginal=obj;
            var arr = str.split("/");
            arr.forEach(function(item,index){
                obj[item]=index==arr.length-1?datoDeEntrada:{};
                obj=obj[item];
            });
            console.log(objOriginal);
            var objToInsert = { topic: topic, data: objOriginal };
            collection.insertOne(objToInsert, function (err, res) {
                if (err) throw err;
                console.log("El valor :" + messageDecrypt + " está en la db");
            });
        } catch (e) {
            console.log("Existe un error en los datos");
        }
    });
}

mongodb.connect(mongodbURI, conectionCreate);
