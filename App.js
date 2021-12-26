import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableNativeFeedback,
  Pressable, //New 터치기반 input( delayLongPress)
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { Fontisto } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { textDecorationColor } from "react-native/Libraries/Components/View/ReactNativeStyleAttributes";
//challenge 1 : 마지막 작업한 탭으로 복원
//challenge 2 : ToDo니깐 완료한 작업 표시 - 완료 버튼도 추가
//challenge 3 : 수정 버튼 추가해서 텍스트 수정할 수 있게 하는것

const STORAGE_KEY = "@toDos";
export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [edittext, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadToDos();
  }, []);
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem("@State", JSON.stringify(working));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {}
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    const d = await AsyncStorage.getItem("@State");
    setToDos(JSON.parse(s)); //Object로 변환
    setWorking(d === "true" ? true : false);
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    /* const newToDos = Object.assign({}, toDos, {
      [Date.now()]: { text, work: working },
    }); 이것도 알아두삼!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, isComplete: false, editable: false },
    }; //위에꺼랑 똑같은 내용
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "calcel" },
      {
        text: "I'm Sure",
        style: "destructive", //only Ios
        onPress: () => {
          const newToDos = { ...toDos }; // 이미 있는걸로 새로 받들고
          delete newToDos[key]; //지우고
          setToDos(newToDos); // 업데이트
          saveToDos(newToDos);
        },
      },
    ]);
  };
  const editToDo = (key) => {
    const newToDos = { ...toDos };
    if (newToDos[key].editable === true) {
      newToDos[key].editable = false;
      newToDos[key].text = edittext;
    } else {
      newToDos[key].editable = true;
    }
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const completeToDo = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].isComplete = true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        keyboardType="default" //알아두면 좋을듯
        returnKeyType="done"
        placeholderTextColor
        onChangeText={onChangeText}
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {toDos && //Ios의 경우 toDos가 아예 없는 경우에는 Render 오류가 발생함. 따라서 toDos가 존재하는지 먼저 검사
          Object.keys(toDos).map(
            (
              key //toDos.map 못하는 이유는 Object 형식이라서.
            ) =>
              toDos[key].working === working ? (
                <View style={styles.toDo} key={key}>
                  <TextInput
                    style={{
                      ...styles.toDoText,
                      textDecorationLine:
                        toDos[key].isComplete === true
                          ? "line-through"
                          : "none",
                    }}
                    onChangeText={(edittext) => setEditText(edittext)}
                    editable={toDos[key].editable}
                  >
                    {toDos[key].text}
                  </TextInput>
                  <View style={styles.btnView}>
                    <TouchableOpacity onPress={() => completeToDo(key)}>
                      <AntDesign name="checkcircle" size={18} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => editToDo(key)}>
                      <Feather name="edit" size={18} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                      <Fontisto name="trash" size={18} color={theme.grey} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  btnView: {
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "space-between",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    flex: 1,
    backgroundColor: theme.toToBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    flex: 3,
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
